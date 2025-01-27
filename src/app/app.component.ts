import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
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
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sorteApp';
  form: FormGroup = this.fb.group({});
  results: number[] = [];
  isLoading: boolean = false;
  minValue: number | null = null;
  maxLimit: number | null = null;
  
  constructor(private fb: FormBuilder) {
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
          Validators.pattern(/^\d+$/)
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
          value: '', 
          disabled: true 
        }, 
        [
          Validators.required, 
          Validators.pattern(/^\d+$/), 
        ]
      ],
    });
  };

  private setupFormListeners(): void {
    this.form.get('min')?.valueChanges.subscribe((min) => this.handleMinChange(min));
    this.form.get('max')?.valueChanges.subscribe((max) => this.handleMaxChange(max));
  };

  private handleMinChange(min: string): void {
    const minControl = this.form.get('min');
    const maxControl = this.form.get('max');
    const winnersControl = this.form.get('winners');
  
    if (minControl?.valid) {
      maxControl?.enable();
    } else {
      maxControl?.disable();
      winnersControl?.disable();
    }
  };
  
  private handleMaxChange(max: string): void {
    console.log(max ? +max - 1 : 0)
    const minControl = this.form.get('min');
    const maxControl = this.form.get('max')
    const winnersControl = this.form.get('winners');
    const min =  minControl?.value;

    this.maxLimit = max ? +max - 1 : 0;
    this.minValue = min + 2;

    minControl?.valid && maxControl?.valid 
    ? winnersControl?.enable() 
    : winnersControl?.disable();
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

  private simulateProcessing(numbers: number[]): void {
    const launchConfetti = () => {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff'],
      });
    };
  
    setTimeout(() => {
      launchConfetti();
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
      winners: ''
    });
    
    this.results = [];
    this.minValue = null;
    this.maxLimit = null;
  }

  get maxWinnersValue(): number {
    const max = this.form.get('max')?.value || 0;
    return max > 1 ? max - 1 : 0;
  }

  get disableButtonClean(): boolean {
    const minValue = this.form.get('min')?.value;
    const maxValue = this.form.get('max')?.value;
    const winnerValue =this.form.get('winner')?.value
  
    return !minValue && !maxValue && !winnerValue
  }

  get exceedsNumberWinners(): boolean {
    const winnersValue = this.form.get('winners')?.value || 0;
    const maxValue = this.form.get('max')?.value || 0;
    return winnersValue > 30 && maxValue > 30;
  }
  
  get equalAmounts(): boolean {
    const equalValue = this.form.get('max')?.value === this.form.get('winners')?.value;
    return equalValue;
  }

  get equalMaxAndWinnerValue(): boolean {
    const maxValue = this.form.get('max')?.value;
    const winnersValue = this.form.get('winners')?.value;
    return maxValue === 30 && winnersValue === 30;
  }
  
  get exceedsMaxLimit(): boolean {
    const winnersValue = this.form.get('winners')?.value || 0;
    const maxValue = this.maxLimit || 0;
    if(winnersValue > maxValue){
      return true
    }
    return false
  }

  get exceedsWinnerLimit(): boolean {
    const winnersValue = this.form.get('winners')?.value
    if (winnersValue > 30){
     return true
    }
    return false
  }

  get returnThirty(): number{
    return 30
  }

}
