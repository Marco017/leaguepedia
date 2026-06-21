import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JsonServerChampionService } from '../../services/json-server-champion';
import { DataDragonService } from '../../services/data-dragon';
import { Champion } from '../../models/champion.model';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

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
  imports: [ReactiveFormsModule, RouterLink, CommonModule, ImageCropperComponent],
  templateUrl: './champion-form.html',
  styleUrls: ['./champion-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChampionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private jsonService = inject(JsonServerChampionService);
  private ddragon = inject(DataDragonService);

  // cropper state
  cropImageType: 'splash' | 'full' | null = null;
  tempImageFile: File | undefined;
  croppedImage: string | null | undefined = null;

  // cropper dimensions
  splashOutputWidth = 881;
  splashOutputHeight = 520;

  fullOutputWidth = 128;
  fullOutputHeight = 128;

  // Previews
  splashPreview = signal<string | null>(null);
  fullPreview = signal<string | null>(null);

  // form state
  isEdit = false;
  championId: string | null = null;
  error = signal('');
  loading = signal(false);

  form = this.fb.group({
    id: ['', Validators.required],
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
      splash: [''],
    }),
    stats: this.fb.group({
      hp: [0], hpperlevel: [0], mp: [0], mpperlevel: [0], movespeed: [0],
      armor: [0], armorperlevel: [0], spellblock: [0], spellblockperlevel: [0],
      attackrange: [0], hpregen: [0], hpregenperlevel: [0], mpregen: [0],
      mpregenperlevel: [0], crit: [0], critperlevel: [0], attackdamage: [0],
      attackdamageperlevel: [0], attackspeed: [0], attackspeedperlevel: [0],
    }),
  });

  // Load champion if editing
  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEdit = true;
      this.championId = id;
      this.loading.set(true);
      //disable id and key fields in edit mode
      this.form.get('id')?.disable();
      this.form.get('key')?.disable();
      try {
        const champion = await this.jsonService.getChampionById(id);
        this.form.patchValue(champion);
        // Set previews if images are base64
        this.setPreviews(champion);
      } catch {
        this.error.set('Champion not found.');
      } finally {
        this.loading.set(false);
      }
    }
  }

  private sanitizeId(name: string): string {
    return name.replace(/[^a-zA-Z]/g, '');
  }
  private randomKey(): number {
    return Math.floor(Math.random() * 1000000);
  }
  private async isKeyUnique(key: number): Promise<boolean> {
    const all = await this.jsonService.getAllCustomChampions();
    return !all.some(c => Number(c.key) === key);
  }

  private setPreviews(champion: Champion) {
    const image = champion.image;
    if (image?.full && image.full.startsWith('data:image')) {
      this.fullPreview.set(image.full);
    }
    if (image?.splash && image.splash.startsWith('data:image')) {
      this.splashPreview.set(image.splash);
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
    // Derive id from name before validating so the required id control is filled.
    if (!this.isEdit) { // necessary to validate id field in create mode
      this.form.get('id')?.setValue(this.sanitizeId(this.form.value.name || ''));
      // Generate a unique numeric key for the new champion
      let uniqueKey: number;
      do {
        uniqueKey = this.randomKey();
      } while (!(await this.isKeyUnique(uniqueKey)));
      this.form.get('key')?.setValue(String(uniqueKey));
    }
    
    if (this.form.invalid){
      this.error.set('Please fill in all required fields.');
      return;
    }
    const formValue = this.form.getRawValue();
    try {
      if (this.isEdit && this.championId) {
        await this.jsonService.updateChampion(this.championId, { ...formValue } as Champion);
      } else {
        const version = await this.ddragon.getVersion();
        await this.jsonService.createChampion({
          ...formValue,
          version: version as string,
        } as Champion);
      }
      this.router.navigate(['/admin']);
    } catch {
      this.error.set('Error saving. Make sure the JSON Server is running.');
    }
  }

  // Splash file selected
  onSplashSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.tempImageFile = file;
    this.cropImageType = 'splash';
  }

  // Full image file selected
  onFullSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.tempImageFile = file;
    this.cropImageType = 'full';
  }

  // Store cropped image temporarily
  async imageCropped(event: ImageCroppedEvent): Promise<void> {
    const blob = event.blob as Blob;
    if (blob.size > 50000) { // 50KB limited by json server
      this.error.set('Image is too large. Please choose an image smaller than 50KB.');
      // Reset the cropper state
      this.cancelCrop();
      // Also clear the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.croppedImage = reader.result as string; // base64 string
    };
    reader.readAsDataURL(blob);
  }

  // Save cropped image (called from Save button)
  saveCroppedImage(): void {
    if (!this.croppedImage || !this.cropImageType) return;
    const currentImage = this.form.getRawValue().image || {
      full: '', sprite: '', splash: '', group: 'champion', x: 0, y: 0, w: 48, h: 48
    };
    if (this.cropImageType === 'splash') {
      this.form.patchValue({
        image: {
          ...currentImage,
          splash: this.croppedImage,
        }
      });
      this.splashPreview.set(this.croppedImage);
    } else if (this.cropImageType === 'full') {
      this.form.patchValue({
        image: {
          ...currentImage,
          full: this.croppedImage,
        }
      });
      this.fullPreview.set(this.croppedImage);
    }
    // Close cropper and reset temp state
    this.cropImageType = null;
    this.tempImageFile = undefined;
    this.croppedImage = null;
  }

  cancelCrop(): void {
    this.cropImageType = null;
    this.tempImageFile = undefined;
    this.croppedImage = null;
  }
  removeSplash(): void {
    this.form.patchValue({
      image: { ...this.form.value.image, splash: '' }
    });
    this.splashPreview.set(null);
  }

  removeFull(): void {
    this.form.patchValue({
      image: { ...this.form.value.image, full: '' }
    });
    this.fullPreview.set(null);
  }

  protected readonly roles = ROLES;
  protected readonly partypes = PARTYPES;
  protected readonly statFields = STAT_FIELDS;
}