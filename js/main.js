function glitchSketch(img) {

  return function (s) {

      let windowW = 280;
      let windowH = 280;
      let isLoaded = false;
      let glitch;
      let imgSrc = img;

      s.setup = function () {
        s.background(0);
        s.createCanvas(windowW, windowH);
        console.log(imgSrc);

        s.loadImage(imgSrc, function (img) {
          glitch = new Glitch(img);
          isLoaded = true;
        });
      }

      s.draw = function () {
        s.clear();
        s.background(0);

        if (isLoaded) {
          glitch.show();
        }
      }

      class Glitch {
        constructor(img) {
          this.channelLen = 4;
          this.imgOrigin = img;
          this.imgOrigin.loadPixels();
          this.copyData = [];
          this.flowLineImgs = [];
          this.shiftLineImgs = [];
          this.shiftRGBs = [];
          this.scatImgs = [];
          this.throughFlag = true;
          this.copyData = new Uint8ClampedArray(this.imgOrigin.pixels);

          // flow line
          for (let i = 0; i < 1; i++) {
            let o = {
              pixels: null,
              t1: s.floor(s.random(0, 1000)),
              speed: s.floor(s.random(4, 24)),
              randX: s.floor(s.random(24, 80))
            };
            this.flowLineImgs.push(o);
          }

          // shift line
          for (let i = 0; i < 6; i++) {
            let o = null;
            this.shiftLineImgs.push(o);
          }

          // shift RGB
          for (let i = 0; i < 1; i++) {
            let o = null;
            this.shiftRGBs.push(o);
          }

          // scat imgs
          for (let i = 0; i < 3; i++) {
            let scatImg = {
              img: null,
              x: 0,
              y: 0
            };
            this.scatImgs.push(scatImg);
          }
        }

        replaceData(destImg, srcPixels) {
          for (let y = 0; y < destImg.height; y++) {
            for (let x = 0; x < destImg.width; x++) {
              let r, g, b, a;
              let index;
              index = (y * destImg.width + x) * this.channelLen;
              r = index;
              g = index + 1;
              b = index + 2;
              a = index + 3;
              destImg.pixels[r] = srcPixels[r];
              destImg.pixels[g] = srcPixels[g];
              destImg.pixels[b] = srcPixels[b];
              destImg.pixels[a] = srcPixels[a];
            }
          }
          destImg.updatePixels();
        }

        flowLine(srcImg, obj) {

          let destPixels, tempY;
          destPixels = new Uint8ClampedArray(srcImg.pixels);
          obj.t1 %= srcImg.height;
          obj.t1 += obj.speed;
          //tempY = floor(noise(obj.t1) * srcImg.height);
          tempY = s.floor(obj.t1);
          for (let y = 0; y < srcImg.height; y++) {
            if (tempY === y) {
              for (let x = 0; x < srcImg.width; x++) {
                let r, g, b, a;
                let index;
                index = (y * srcImg.width + x) * this.channelLen;
                r = index;
                g = index + 1;
                b = index + 2;
                a = index + 3;
                destPixels[r] = srcImg.pixels[r] + obj.randX;
                destPixels[g] = srcImg.pixels[g] + obj.randX;
                destPixels[b] = srcImg.pixels[b] + obj.randX;
                destPixels[a] = srcImg.pixels[a];
              }
            }
          }
          return destPixels;
        }

        shiftLine(srcImg) {

          let offsetX;
          let rangeMin, rangeMax;
          let destPixels;
          let rangeH;

          destPixels = new Uint8ClampedArray(srcImg.pixels);
          rangeH = srcImg.height;
          rangeMin = s.floor(s.random(0, rangeH));
          rangeMax = rangeMin + s.floor(s.random(1, rangeH - rangeMin));
          offsetX = this.channelLen * s.floor(s.random(-40, 40));

          for (let y = 0; y < srcImg.height; y++) {
            if (y > rangeMin && y < rangeMax) {
              for (let x = 0; x < srcImg.width; x++) {
                let r, g, b, a;
                let r2, g2, b2, a2;
                let index;

                index = (y * srcImg.width + x) * this.channelLen;
                r = index;
                g = index + 1;
                b = index + 2;
                a = index + 3;
                r2 = r + offsetX;
                g2 = g + offsetX;
                b2 = b + offsetX;
                destPixels[r] = srcImg.pixels[r2];
                destPixels[g] = srcImg.pixels[g2];
                destPixels[b] = srcImg.pixels[b2];
                destPixels[a] = srcImg.pixels[a];
              }
            }
          }
          return destPixels;
        }

        shiftRGB(srcImg) {

          let randR, randG, randB;
          let destPixels;
          let range;

          range = 16;
          destPixels = new Uint8ClampedArray(srcImg.pixels);
          randR = (s.floor(s.random(-range, range)) * srcImg.width + s.floor(s.random(-range, range))) * this.channelLen;
          randG = (s.floor(s.random(-range, range)) * srcImg.width + s.floor(s.random(-range, range))) * this.channelLen;
          randB = (s.floor(s.random(-range, range)) * srcImg.width + s.floor(s.random(-range, range))) * this.channelLen;

          for (let y = 0; y < srcImg.height; y++) {
            for (let x = 0; x < srcImg.width; x++) {
              let r, g, b, a;
              let r2, g2, b2, a2;
              let index;

              index = (y * srcImg.width + x) * this.channelLen;
              r = index;
              g = index + 1;
              b = index + 2;
              a = index + 3;
              r2 = (r + randR) % srcImg.pixels.length;
              g2 = (g + randG) % srcImg.pixels.length;
              b2 = (b + randB) % srcImg.pixels.length;
              destPixels[r] = srcImg.pixels[r2];
              destPixels[g] = srcImg.pixels[g2];
              destPixels[b] = srcImg.pixels[b2];
              destPixels[a] = srcImg.pixels[a];
            }
          }

          return destPixels;
        }

        getRandomRectImg(srcImg) {
          let startX;
          let startY;
          let rectW;
          let rectH;
          let destImg;
          startX = s.floor(s.random(0, srcImg.width - 30));
          startY = s.floor(s.random(0, srcImg.height - 50));
          rectW = s.floor(s.random(30, srcImg.width - startX));
          rectH = s.floor(s.random(1, 50));
          destImg = srcImg.get(startX, startY, rectW, rectH);
          destImg.loadPixels();
          return destImg;
        }

        show() {

          // restore the original state
          this.replaceData(this.imgOrigin, this.copyData);

          // sometimes pass without effect processing
          let n = s.floor(s.random(100));
          if (n > 75 && this.throughFlag) {
            this.throughFlag = false;
            setTimeout(() => {
              this.throughFlag = true;
            }, s.floor(s.random(40, 400)));
          }
          if (!this.throughFlag) {
            s.push();
            s.translate((s.width - this.imgOrigin.width) / 2, (s.height - this.imgOrigin.height) / 2);
            s.image(this.imgOrigin, 0, 0);
            s.pop();
            return;
          }

          // flow line
          this.flowLineImgs.forEach((v, i, arr) => {
            arr[i].pixels = this.flowLine(this.imgOrigin, v);
            if (arr[i].pixels) {
              this.replaceData(this.imgOrigin, arr[i].pixels);
            }
          });

          // shift line
          this.shiftLineImgs.forEach((v, i, arr) => {
            if (s.floor(s.random(100)) > 50) {
              arr[i] = this.shiftLine(this.imgOrigin);
              this.replaceData(this.imgOrigin, arr[i]);
            } else {
              if (arr[i]) {
                this.replaceData(this.imgOrigin, arr[i]);
              }
            }
          });

          // shift rgb
          this.shiftRGBs.forEach((v, i, arr) => {
            if (s.floor(s.random(100)) > 65) {
              arr[i] = this.shiftRGB(this.imgOrigin);
              this.replaceData(this.imgOrigin, arr[i]);
            }
          });

          s.push();
          s.translate((s.width - this.imgOrigin.width) / 2, (s.height - this.imgOrigin.height) / 2);
          s.image(this.imgOrigin, 0, 0);
          s.pop();

          // scat image
          this.scatImgs.forEach(obj => {
            s.push();
            s.translate((s.width - this.imgOrigin.width) / 2, (s.height - this.imgOrigin.height) / 2);
            if (s.floor(s.random(100)) > 80) {
              obj.x = s.floor(s.random(-this.imgOrigin.width * 0.3, this.imgOrigin.width * 0.7));
              obj.y = s.floor(s.random(-this.imgOrigin.height * 0.1, this.imgOrigin.height));
              obj.img = this.getRandomRectImg(this.imgOrigin);
            }
            if (obj.img) {
              s.image(obj.img, obj.x, obj.y);
            }
            s.pop();
          });
        }

      }

  }
}

let carmenGlitch = glitchSketch('https://res.cloudinary.com/nucliweb/image/upload/c_scale,q_auto,w_280/v1547980736/PCDGirona/carmen-ansio.jpg');
new p5(carmenGlitch, 'carmenGlitch');

let daniGlitch = glitchSketch('https://res.cloudinary.com/nucliweb/image/upload/c_scale,q_auto,w_280/v1548014835/PCDGirona/dani-herrera.jpg');
new p5(daniGlitch, 'daniGlitch');

let joanGlitch = glitchSketch('https://res.cloudinary.com/nucliweb/image/upload/c_scale,q_auto,w_280/v1547980736/PCDGirona/joan-leon.jpg');
new p5(joanGlitch, 'joanGlitch');

let victorGlitch = glitchSketch('https://res.cloudinary.com/nucliweb/image/upload/c_scale,q_auto,w_280/v1547980736/PCDGirona/victor-martin.jpg');
new p5(victorGlitch, 'victorGlitch');
