(() => {
    class CoverCanvas {
        isDragging = false;
        backgroundImage = new Image();
        iconImage = new Image();

        // 履歴表示用のノードID
        id_recent_downloads = "recent_downloads";

        constructor(
            id_background,
            id_icon,
            id_canvas,
            id_saveButton,
            width_canvas
        ) {
            this.id_background = id_background;
            this.id_icon = id_icon;
            this.id_canvas = id_canvas;
            this.id_saveButton = id_saveButton;
            this.width_canvas = width_canvas;

            this.pickup_top = 0;
        }

        init() {
            this.backgroundImageElement = document.getElementById(
                this.id_background
            );
            this.iconImageElement = document.getElementById(this.id_icon);
            this.canvasElement = document.getElementById(this.id_canvas);
            this.ctx = this.canvasElement.getContext("2d");
            this.saveButtonElement = document.getElementById(
                this.id_saveButton
            );
            this.recent_downloads = document.getElementById(
                this.id_recent_downloads
            );

            this.setButtonEvent(
                this.backgroundImageElement,
                this.iconImageElement,
                this.saveButtonElement
            );

            this.setCanvasEvent();
        }

        updateCanvas(flag_resize = true, flag_draw_rectangle = true) {
            if (this.backgroundImage.complete && this.iconImage.complete) {
                const ctx = this.ctx;
                const pickup_top = this.pickup_top;
                const canvas = this.canvasElement;

                // キャンバスのサイズを設定
                if (flag_resize) {
                    let max_width = Math.max(
                        this.backgroundImage.width,
                        this.iconImage.width
                    );
                    let max_height = Math.max(
                        this.backgroundImage.height,
                        this.iconImage.height
                    );

                    canvas.width = this.width_canvas;
                    canvas.height =
                        (this.width_canvas * max_height) / max_width;
                }

                // キャンバスをクリア
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 1枚目の画像を描画
                ctx.drawImage(
                    this.backgroundImage,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

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
                ctx.drawImage(this.iconImage, 0, pickup_top, 161, 161);
            }
        }

        setButtonEvent(imageInput1, imageInput2, saveButton) {
            const self = this;
            imageInput1.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    self.backgroundImage.src = URL.createObjectURL(file);
                    self.backgroundImage.onload = self.updateCanvas.bind(self);
                }
            });

            imageInput2.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    self.iconImage.src = URL.createObjectURL(file);
                    self.iconImage.onload = self.updateCanvas.bind(self, false);
                }
            });

            saveButton.addEventListener("click", function () {
                self.updateCanvas(false, false);

                // 元のcanvasの一部をコピーするための一時キャンバスを作成
                const tempCanvas = document.createElement(self.id_canvas);
                tempCanvas.width = 1280;
                tempCanvas.height = 161;
                const tempCtx = tempCanvas.getContext("2d");

                // rectangle_top が正しいか確認（デバッグ用にconsole.logで値を確認）
                console.log("rectangle_top:", self.pickup_top);

                // もとのcanvasの一部を一時キャンバスに描画
                tempCtx.drawImage(
                    self.canvasElement,
                    0,
                    -self.pickup_top,
                    1280,
                    self.canvasElement.height
                );

                // 一時キャンバスを画面に追加して描画範囲を確認（デバッグ用）
                self.recent_downloads.appendChild(tempCanvas);

                // 一時キャンバスのデータをダウンロード用リンクに設定
                const link = document.createElement("a");
                link.download = "overlaid_image.png";
                link.href = tempCanvas.toDataURL("image/png");

                // リンクをクリックしてダウンロードをトリガー
                link.click();

                self.updateCanvas(false, true);
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
                self.updateCanvas(false);
            });

            clickable_canvas.addEventListener("mousemove", function (event) {
                if (self.isDragging) {
                    self.pickup_top = event.offsetY - 80;
                    self.updateCanvas(false);
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
