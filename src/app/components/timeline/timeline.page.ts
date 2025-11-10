import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

interface TimelineStep {
  number: string;
  icon: string;
  title: string;
  description: string;
  color: 'blue' | 'amber' | 'stone';
}

interface ColorClasses {
  blue: {
    gradient: string;
    text: string;
    bg: string;
  };
  amber: {
    gradient: string;
    text: string;
    bg: string;
  };
  stone: {
    gradient: string;
    text: string;
    bg: string;
  };
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.page.html',
  styleUrls: ['./timeline.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class TimelineComponent {
  steps: TimelineStep[] = [
    {
      number: '01',
      icon: 'assets/person.svg',
      title: 'Join the Network',
      description:
        "Sign up and verify your seller profile to access Vault's trusted ecosystem of sellers.",
      color: 'blue',
    },
    {
      number: '02',
      icon: 'assets/inventory.svg',
      title: 'Add Your Inventory',
      description:
        'Scan or import your inventory from spreadsheets or integrated marketplaces — Vault syncs everything automatically.',
      color: 'amber',
    },
    {
      number: '03',
      icon: 'assets/community.svg',
      title: 'List & Connect with the Community',
      description:
        "List your products on Vault's marketplace, connect with verified members, and discover new sourcing and sales opportunities.",
      color: 'stone',
    },
    {
      number: '04',
      icon: 'assets/chart.svg',
      title: 'Track & Scale',
      description:
        'Monitor sales, margins, and performance analytics to scale your business intelligently and maximize profitability.',
      color: 'blue',
    },
  ];

  colorClasses: ColorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      text: 'text-blue-400',
      bg: 'bg-blue-500/20',
    },
    amber: {
      gradient: 'from-amber-500 to-amber-600',
      text: 'text-amber-400',
      bg: 'bg-amber-500/20',
    },
    stone: {
      gradient: 'from-stone-500 to-stone-600',
      text: 'text-stone-400',
      bg: 'bg-stone-500/20',
    },
  };

  getColors(step: TimelineStep) {
    return this.colorClasses[step.color];
  }

  isEven(index: number): boolean {
    return index % 2 === 0;
  }
}
