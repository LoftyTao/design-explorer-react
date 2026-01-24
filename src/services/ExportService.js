import html2canvas from 'html2canvas';

export class ExportService {
  static async exportImage(containerElement, format = 'png', filename = 'parallel-coordinates') {
    const canvas = await html2canvas(containerElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${filename}.${format}`;
    link.click();
  }

  static async export(format, containerElement) {
    await this.exportImage(containerElement, format);
  }
}
