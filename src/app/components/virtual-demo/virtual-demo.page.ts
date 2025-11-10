import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface InventoryItem {
  name: string;
  cost: string;
  qty: string;
  profit: string;
}

interface MarketplaceItem {
  name: string;
  price: string;
  status: string;
  image: string;
}

@Component({
  selector: 'app-virtual-demo',
  templateUrl: './virtual-demo.page.html',
  styleUrls: ['./virtual-demo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class VirtualDemoComponent implements OnInit, OnDestroy {
  stage: number = 0;
  private intervalId?: any;

  inventoryItems: InventoryItem[] = [
    { name: 'Air Jordan 1', cost: '$140', qty: '32', profit: '+$2,880' },
    { name: 'Yeezy 350', cost: '$220', qty: '18', profit: '+$3,240' },
    { name: 'Adidas Sambas', cost: '$85', qty: '45', profit: '+$1,800' },
  ];

  marketplaceItems: MarketplaceItem[] = [
    {
      name: 'Air Jordan 1',
      price: '$230',
      status: 'Pricing Recommendation ✓',
      image: 'assets/air-jordan-1.png',
    },
    {
      name: 'Nike Air Max 1',
      price: '$340',
      status: 'Marketplace Match Found ✓',
      image: 'assets/nike-air-max.png',
    },
  ];

  analyticsBars: number[] = [45, 62, 38, 71, 55, 68, 42, 59, 73, 51, 66, 48];

  ngOnInit() {
    const sequence = [
      { stage: 0, delay: 0 },
      { stage: 1, delay: 3000 },
      { stage: 2, delay: 6000 },
      { stage: 3, delay: 9000 },
      { stage: 4, delay: 12000 },
    ];

    const runSequence = () => {
      sequence.forEach(({ stage: nextStage, delay }) => {
        setTimeout(() => {
          this.stage = nextStage;
        }, delay);
      });
    };

    runSequence();
    this.intervalId = setInterval(runSequence, 15000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getStageClass(stageNum: number): string {
    return this.stage === stageNum ? 'opacity-100' : 'opacity-0';
  }

  getStage0Class(): string {
    return this.stage >= 1 ? 'opacity-0' : 'opacity-100';
  }
}
