import { Component, Input, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, ChartOptions, registerables, ChartType } from 'chart.js';
import { ChartData as AnalyticsChartData } from '../../core/models';

Chart.register(...registerables);

@Component({
  selector: 'app-animated-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" [class.loading]="isLoading">
      <div class="chart-header" *ngIf="chartData?.title">
        <h3>{{ chartData?.title }}</h3>
        <div class="chart-controls">
          <button class="chart-btn" (click)="animateChart()" title="Refresh Animation">
            <span class="material-icons">refresh</span>
          </button>
          <button class="chart-btn" (click)="toggleFullscreen()" title="Fullscreen">
            <span class="material-icons">fullscreen</span>
          </button>
        </div>
      </div>
      
      <div class="chart-wrapper" #chartWrapper>
        <canvas #chartCanvas 
                [width]="canvasWidth" 
                [height]="canvasHeight">
        </canvas>
        
        <div class="chart-overlay" *ngIf="showOverlay" (click)="hideOverlay()">
          <div class="chart-details">
            <h4>{{ selectedDataPoint?.label }}</h4>
            <p>{{ selectedDataPoint?.value }}</p>
            <div class="close-btn" (click)="hideOverlay()">
              <span class="material-icons">close</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chart-legend" *ngIf="showLegend && chart">
        <div *ngFor="let item of legendItems" 
             class="legend-item animated-legend-item"
             (click)="toggleDataset(item.index)">
          <div class="legend-color" [style.background-color]="item.color"></div>
          <span class="legend-label" [class.disabled]="item.hidden">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </div>
      </div>
      
      <div class="loading-spinner" *ngIf="isLoading">
        <span class="material-icons spinning">autorenew</span>
        <p>Loading chart...</p>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.06);
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .chart-container:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      transform: translateY(-2px);
    }

    .chart-container.loading {
      pointer-events: none;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
    }

    .chart-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }

    .chart-controls {
      display: flex;
      gap: 8px;
    }

    .chart-btn {
      background: #3498db;
      color: white;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .chart-btn:hover {
      background: #2980b9;
      transform: scale(1.1);
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      margin-bottom: 20px;
    }

    .chart-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
    }

    .chart-details {
      background: white;
      padding: 30px;
      border-radius: 12px;
      position: relative;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transform: scale(0.8);
      animation: popIn 0.3s ease 0.1s forwards;
    }

    .chart-details h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 20px;
    }

    .chart-details p {
      margin: 0;
      color: #7f8c8d;
      font-size: 24px;
      font-weight: bold;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      color: #95a5a6;
      transition: color 0.3s ease;
    }

    .close-btn:hover {
      color: #e74c3c;
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      justify-content: center;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .legend-item:hover {
      background: #f8f9fa;
      border-color: #e9ecef;
      transform: translateY(-1px);
    }

    .animated-legend-item {
      animation: slideInUp 0.5s ease forwards;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-label {
      font-size: 14px;
      color: #2c3e50;
      font-weight: 500;
      transition: opacity 0.3s ease;
    }

    .legend-label.disabled {
      opacity: 0.4;
      text-decoration: line-through;
    }

    .legend-value {
      font-size: 12px;
      color: #7f8c8d;
      background: #ecf0f1;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }

    .loading-spinner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #3498db;
    }

    .loading-spinner p {
      margin-top: 10px;
      color: #7f8c8d;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    @keyframes popIn {
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    canvas {
      max-width: 100%;
      height: auto !important;
    }

    @media (max-width: 768px) {
      .chart-container {
        padding: 15px;
      }
      
      .chart-header h3 {
        font-size: 16px;
      }
      
      .chart-wrapper {
        height: 250px;
      }
      
      .legend-item {
        padding: 6px 10px;
        font-size: 12px;
      }
    }
  `]
})
export class AnimatedChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartWrapper', { static: true }) chartWrapper!: ElementRef<HTMLDivElement>;
  
  @Input() chartData: AnalyticsChartData | null = null;
  @Input() showLegend = true;
  @Input() animated = true;
  @Input() responsive = true;
  @Input() canvasWidth = 800;
  @Input() canvasHeight = 400;

  chart: Chart | null = null;
  isLoading = false;
  showOverlay = false;
  selectedDataPoint: any = null;
  legendItems: any[] = [];

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    if (this.chartData) {
      this.createChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createChart(): void {
    if (!this.chartData || !this.chartCanvas) return;

    this.isLoading = true;

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartConfig: ChartConfiguration = {
      type: this.chartData.type as ChartType,
      data: this.convertToChartJsData(this.chartData),
      options: this.getChartOptions()
    };

    setTimeout(() => {
      this.chart = new Chart(ctx, chartConfig);
      this.updateLegendItems();
      this.isLoading = false;
    }, 500); // Simulate loading time
  }

  private convertToChartJsData(data: AnalyticsChartData): ChartData {
    return {
      labels: data.labels,
      datasets: data.datasets.map(dataset => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: this.getBackgroundColors(dataset.backgroundColor, data.type),
        borderColor: dataset.borderColor || dataset.backgroundColor,
        borderWidth: dataset.borderWidth || 2,
        fill: dataset.fill || false,
        tension: data.type === 'line' ? 0.4 : undefined,
        hoverOffset: data.type === 'pie' || data.type === 'doughnut' ? 10 : undefined
      }))
    };
  }

  private getBackgroundColors(color: string, chartType: string): string | string[] {
    if (chartType === 'pie' || chartType === 'doughnut') {
      // Return array of colors for pie/doughnut charts
      return color.includes(',') ? color.split(',') : [color];
    }
    return color;
  }

  private getChartOptions(): ChartOptions {
    return {
      responsive: this.responsive,
      maintainAspectRatio: false,
      animation: {
        duration: this.animated ? 2000 : 0,
        easing: 'easeInOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: false // We'll use custom legend
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0,0,0,0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3498db',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: this.getScaleOptions(),
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const element = elements[0];
          const dataIndex = element.index;
          const datasetIndex = element.datasetIndex;
          
          if (this.chart && this.chartData) {
            const dataset = this.chartData.datasets[datasetIndex];
            const label = this.chartData.labels[dataIndex];
            const value = dataset.data[dataIndex];
            
            this.selectedDataPoint = { label, value };
            this.showOverlay = true;
          }
        }
      }
    };
  }

  private getScaleOptions(): any {
    if (!this.chartData || this.chartData.type === 'pie' || this.chartData.type === 'doughnut') {
      return {};
    }

    return {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          color: '#7f8c8d'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          color: '#7f8c8d'
        }
      }
    };
  }

  private updateLegendItems(): void {
    if (!this.chart || !this.chartData) return;

    this.legendItems = this.chartData.datasets.map((dataset, index) => ({
      index,
      label: dataset.label,
      color: dataset.backgroundColor,
      value: dataset.data.reduce((a, b) => a + b, 0),
      hidden: false
    }));
  }

  animateChart(): void {
    if (this.chart) {
      this.chart.update('active');
    }
  }

  toggleFullscreen(): void {
    const wrapper = this.chartWrapper.nativeElement;
    if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen();
    }
  }

  toggleDataset(index: number): void {
    if (!this.chart) return;

    const dataset = this.chart.data.datasets[index];
    const meta = this.chart.getDatasetMeta(index);
    
    meta.hidden = !meta.hidden;
    this.legendItems[index].hidden = meta.hidden;
    
    this.chart.update();
  }

  hideOverlay(): void {
    this.showOverlay = false;
    this.selectedDataPoint = null;
  }
}