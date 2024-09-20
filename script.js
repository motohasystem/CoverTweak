(() => {
    class CoverCanvas {
        isDragging = false;
        image1 = new Image();
        image2 = new Image();

        constructor(image1, image2, canvas, saveButton, width_canvas) {
            this.id_image1 = image1;
            this.id_image2 = image2;
            this.id_canvas = canvas;
            this.id_saveButton = saveButton;
            this.width_canvas = width_canvas;

            this.pickup_top = 0;
        }

        init() {
            this.imageInput1 = document.getElementById(this.id_image1);
            this.imageInput2 = document.getElementById(this.id_image2);
            this.canvas = document.getElementById(this.id_canvas);
            this.ctx = this.canvas.getContext("2d");
            this.saveButton = document.getElementById(this.id_saveButton);

            this.setButtonEvent(
                this.imageInput1,
                this.imageInput2,
                this.saveButton
            );

            this.setCanvasEvent();
        }

        updateCanvas(flag_draw_rectangle = true) {
            // if (this.image1 === undefined || this.image2 === undefined) {
            //     throw new Error("画像が読み込まれていません");
            // }

            if (this.image1.complete && this.image2.complete) {
                const ctx = this.ctx;
                const pickup_top = this.pickup_top;
                const canvas = this.canvas;

                // キャンバスのサイズを設定
                let max_width = Math.max(this.image1.width, this.image2.width);
                let max_height = Math.max(
                    this.image1.height,
                    this.image2.height
                );

                canvas.width = this.width_canvas;
                canvas.height = (this.width_canvas * max_height) / max_width;

                // キャンバスをクリア
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 1枚目の画像を描画
                ctx.drawImage(this.image1, 0, 0, canvas.width, canvas.height);

                if (flag_draw_rectangle) {
                    // 0, 0を起点に、1280 x 161のサイズで白い枠線だけの四角形を描画
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, pickup_top, 1280, 161);

                    // 128,0 を起点に、1232x48のサイズで白い塗りつぶし四角を描画
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.fillRect(161, pickup_top, 1232, 48);
                    ctx.fillRect(161, pickup_top + 48 + 64, 1232, 48);
                }

                // 2枚目の画像を重ねて描画
                ctx.drawImage(this.image2, 0, pickup_top, 161, 161);
            }
        }

        setButtonEvent(imageInput1, imageInput2, saveButton) {
            const self = this;
            imageInput1.addEventListener("change", function (event) {
                const file = event.target.files[0];
                console.log({ file });
                if (file) {
                    self.image1.src = URL.createObjectURL(file);
                    self.image1.onload = self.updateCanvas.bind(self);
                }
            });

            imageInput2.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    self.image2.src = URL.createObjectURL(file);
                    self.image2.onload = self.updateCanvas.bind(self);
                }
            });

            saveButton.addEventListener("click", function () {
                self.updateCanvas(false);

                // 元のcanvasの一部をコピーするための一時キャンバスを作成
                const tempCanvas = document.createElement(self.id_canvas);
                tempCanvas.width = 1280;
                tempCanvas.height = 161;
                const tempCtx = tempCanvas.getContext("2d");

                // rectangle_top が正しいか確認（デバッグ用にconsole.logで値を確認）
                console.log("rectangle_top:", self.pickup_top);

                // もとのcanvasの一部を一時キャンバスに描画
                tempCtx.drawImage(
                    self.canvas,
                    0,
                    -self.pickup_top,
                    1280,
                    self.canvas.height
                );

                // 一時キャンバスを画面に追加して描画範囲を確認（デバッグ用）
                document.body.appendChild(tempCanvas);

                // 一時キャンバスのデータをダウンロード用リンクに設定
                const link = document.createElement("a");
                link.download = "overlaid_image.png";
                link.href = tempCanvas.toDataURL("image/png");

                // リンクをクリックしてダウンロードをトリガー
                link.click();

                self.updateCanvas(true);
            });
        }

        setCanvasEvent() {
            // キャンバスの描画とクリック・マウスドラッグイベントの処理
            const clickable_canvas = document.getElementById(this.id_canvas);
            this.isDragging = false;

            const self = this;
            clickable_canvas.addEventListener("mousedown", function (event) {
                self.isDragging = true;
                self.pickup_top = event.offsetY - 80;
                self.updateCanvas();
            });

            clickable_canvas.addEventListener("mousemove", function (event) {
                if (self.isDragging) {
                    self.pickup_top = event.offsetY - 80;
                    self.updateCanvas();
                }
            });

            clickable_canvas.addEventListener("mouseup", function () {
                self.isDragging = false;
            });

            clickable_canvas.addEventListener("mouseleave", function () {
                self.isDragging = false;
            });
        }
    }

    const canvas = new CoverCanvas(
        "image1",
        "image2",
        "canvas",
        "saveButton",
        1280
    );
    canvas.init();
})();
