const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Фон
    ctx.fillStyle = '#ff9eb5';
    ctx.fillRect(0, 0, size, size);
    
    // Китайский иероглиф
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.6}px 'ZCOOL XiaoWei', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('汉', size / 2, size / 2);
    
    // Сохраняем в файл
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
    console.log(`Создана иконка ${size}x${size}`);
}

// Генерируем иконки всех размеров
sizes.forEach(generateIcon);
