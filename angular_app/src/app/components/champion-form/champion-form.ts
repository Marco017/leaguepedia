import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JsonServerChampionService } from '../../services/json-server-champion';
import { DataDragonService } from '../../services/data-dragon';
import { Champion } from '../../models/champion.model';

const ROLES = ['Fighter', 'Mage', 'Assassin', 'Tank', 'Support', 'Marksman'];
const PARTYPES = [
  'Mana', 'Energy', 'Fury', 'Rage', 'Flow', 'Heat',
  'Ferocity', 'Courage', 'Grit', 'Blood Well', 'Shield', 'None',
];
const STAT_FIELDS: [keyof Champion['stats'], string][] = [
  ['hp', 'HP'], ['hpperlevel', 'HP per level'],
  ['mp', 'Mana'], ['mpperlevel', 'Mana per level'],
  ['movespeed', 'Move Speed'], ['armor', 'Armor'],
  ['armorperlevel', 'Armor per level'], ['spellblock', 'Magic Resist'],
  ['spellblockperlevel', 'Magic Resist per level'], ['attackrange', 'Attack Range'],
  ['hpregen', 'HP Regeneration'], ['hpregenperlevel', 'HP Regeneration per level'],
  ['mpregen', 'Mana Regeneration'], ['mpregenperlevel', 'Mana Regeneration per level'],
  ['crit', 'Critical Strike Chance'], ['critperlevel', 'Critical Strike Chance per level'],
  ['attackdamage', 'Attack Damage'], ['attackdamageperlevel', 'Attack Damage per level'],
  ['attackspeed', 'Attack Speed'], ['attackspeedperlevel', 'Attack Speed per level'],
];

@Component({
  selector: 'app-champion-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './champion-form.html',
  styleUrls: ['./champion-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChampionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jsonService = inject(JsonServerChampionService);
  private ddragon = inject(DataDragonService);

  isEdit = false;
  championId: string | null = null;
  error = signal('');
  loading = signal(false);

  form = this.fb.group({
    id: [{ value: '', disabled: false }, Validators.required],
    key: ['', Validators.required],
    name: ['', Validators.required],
    title: ['', Validators.required],
    blurb: [''],
    partype: ['Mana'],
    tags: [[] as string[]],
    info: this.fb.group({
      attack: [5],
      defense: [5],
      magic: [5],
      difficulty: [5],
    }),
    image: this.fb.group({
      full: [''],
      sprite: [''],
      group: ['champion'],
      x: [0],
      y: [0],
      w: [48],
      h: [48],
    }),
    stats: this.fb.group({
      hp: [0], hpperlevel: [0], mp: [0], mpperlevel: [0], movespeed: [0],
      armor: [0], armorperlevel: [0], spellblock: [0], spellblockperlevel: [0],
      attackrange: [0], hpregen: [0], hpregenperlevel: [0], mpregen: [0],
      mpregenperlevel: [0], crit: [0], critperlevel: [0], attackdamage: [0],
      attackdamageperlevel: [0], attackspeed: [0], attackspeedperlevel: [0],
    }),
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.championId = id;
      this.loading.set(true);
      try {
        const champion = await this.jsonService.getChampionById(id);
        this.form.patchValue(champion);
        if (this.isEdit) this.form.get('id')?.disable();
      } catch {
        this.error.set('Champion not found.');
      } finally {
        this.loading.set(false);
      }
    }
  }

  toggleTag(tag: string) {
    const current = this.form.value.tags ?? [];
    const newTags = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    this.form.patchValue({ tags: newTags });
  }

  isTagChecked(tag: string): boolean {
    return (this.form.value.tags ?? []).includes(tag);
  }

  async onSubmit() {
    if (this.form.invalid) return;
    this.error.set('');
    const formValue = this.form.getRawValue(); // includes disabled id for edit

    try {
      if (this.isEdit && this.championId) {
        await this.jsonService.updateChampion(this.championId, { ...formValue } as Champion);
      } else {
        
        await this.jsonService.createChampion({
          ...formValue as Champion,
          version: this.ddragon.getVersion(),
        } as any);
      }
      this.router.navigate(['/admin']);
    } catch {
      this.error.set('Error saving. Make sure the JSON Server is running.');
    }
  }

  protected readonly roles = ROLES;
  protected readonly partypes = PARTYPES;
  protected readonly statFields = STAT_FIELDS;
}