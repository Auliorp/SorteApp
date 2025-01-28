import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'sorteApp';
  form: FormGroup = this.fb.group({});
  results: number[] = [];
  isLoading: boolean = false;
  minValue: number | null = null;
  
  constructor(
    private fb: FormBuilder) {
    this.createForm();
    this.setupFormListeners();
  };

  ngOnInit(): void {
  }

  private createForm(): void{
    this.form = this.fb.group({
      min: ['', 
        [
          Validators.required, 
          Validators.pattern(/^\d+$/),
          Validators.min(0)
        ]
      ],
      max: [
        { 
          value: '',
           disabled: true 
        }, 
        [
          Validators.required, 
          Validators.pattern(/^\d+$/)
        ]
      ],
      winners: [
        { 
          value: null, 
          disabled: true 
        }, 
        [
          Validators.required, 
          Validators.pattern(/^\d+$/),
          Validators.max(30),
          Validators.min(1),
        ]
      ],
    });
  };

  

  private setupFormListeners(): void {
    this.controls.min?.valueChanges.subscribe((value) => this.handleMinChange(value));
    this.controls.max?.valueChanges.subscribe((value) => this.handleMaxChange(value));
    this.controls.winners?.valueChanges.subscribe((value) => this.handleWinnersValueChange(value));
  };

  private handleMinChange(min: string): void {
    const { min: minControl, max: maxControl, winners: winnersControl } = this.controls;
  
    if (minControl?.valid) {
      maxControl?.enable();
    } else {
      maxControl?.disable();
      winnersControl?.disable();
    }
  };
  
  private handleMaxChange(max: string): void {
    const { min: minControl, max: maxControl, winners: winnersControl } = this.controls;
    const min =  minControl?.value;

    this.minValue = min + 2;

    minControl?.valid && maxControl?.valid 
    ? winnersControl?.enable() 
    : winnersControl?.disable();
  }

  private handleWinnersValueChange(value: number): void {
    const { max, winners } = this.controls;
    const maxValue = max?.value;
    
    if(value === maxValue || value > maxValue && maxValue <= 30 ){
      winners?.setValue(maxValue - 1);
    }
    if (maxValue > 30 && (value >= maxValue || value > 30)) {
      winners?.setValue(30);
    }
  }

  onSubmit() {
    const isFormReady = this.form.valid && !this.isLoading;
    const generatedNumbers = this.generateRandomNumbers();

    if (isFormReady) {
      this.results = [];
      this.isLoading = true;
      this.simulateProcessing(generatedNumbers);
    }
  }

  private generateRandomNumbers(): number[] {
    const { min, max, winners } = this.form.value;
    const minNum = +min;
    const maxNum = +max;
    const winnersNum = +winners;
    const generatedNumbers = new Set<number>();
  
    while (generatedNumbers.size < winnersNum) {
      const randomNumber = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      generatedNumbers.add(randomNumber);
    }
  
    return Array.from(generatedNumbers);
  }


  private launchConfetti(): void {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    });
  }

  private simulateProcessing(numbers: number[]): void {
    setTimeout(() => {
      this.launchConfetti();
      this.results = numbers;
      this.isLoading = false;
    }, 2000);
  }

  preventInvalidInput(event: KeyboardEvent): void {
    const invalidChars = [',', '.', '-', '+', 'e'];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  onReset() {
    this.form.reset({
      min: '',
      max: '',
      winners: null,
    });
  }

  get disableButtonClean(): boolean {
    const { min, max, winners } = this.controls;

    return !min?.value && !max?.value && !winners?.value;
  }

  get controls() {
    return {
      min: this.form.get('min'),
      max: this.form.get('max'),
      winners: this.form.get('winners'),
    };
  }
}
