(() => {
    class CoverCanvas {
        isDragging = false;
        backgroundImage = new Image();
        iconImage = new Image();
        iconRectSize = 128;

        // 履歴表示用のノードID
        id_recent_downloads = "recent_downloads";

        // ペースト対象の画像
        pasteTarget = ""; //  "bg" | "icon"
        
        // プレビュー用キャンバス
        previewCanvas = null;

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

            // ラジオボタンを選択するとthis.iconRectSizeが変わるようにする
            const radioButtons = document.querySelectorAll(
                'input[type="radio"]'
            );
            radioButtons.forEach((radioButton) => {
                radioButton.addEventListener("change", () => {
                    this.iconRectSize = parseInt(radioButton.value);
                    this.updateCanvas(false);
                });
            });

            // saveButtonをグレーアウト
            this.activateSaveButton(false);
            // this.saveButtonElement.disabled = true;
            // this.saveButtonElement.style.backgroundColor = "#ccc";

            // ホバーイベントを設定
            this.listenHoverEvent("select_background_image", "bg");
            this.listenHoverEvent("select_icon_image", "icon");

            // ペーストイベントを設定
            this.setPasteAction();
            
            // ドラッグ&ドロップイベントを設定
            this.setupDragAndDrop();
            
            // クリックイベントを設定（ファイル選択ダイアログを開く）
            this.setupClickToSelect();
            
            // コピーボタンの初期設定
            this.setupCopyButtons();
        }

        setPasteAction() {
            // ペーストイベントリスナーの追加
            document.addEventListener("paste", (event) => {
                if (this.pasteTarget === "") return;

                const items = event.clipboardData.items;

                for (let item of items) {
                    if (item.type.startsWith("image/")) {
                        const file = item.getAsFile();
                        const img = new Image();

                        // ファイルを読み込み、画像が読み込まれたらcanvasに描画
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            img.src = e.target.result;
                        };
                        reader.readAsDataURL(file);

                        img.onload = () => {
                            // Canvasの大きさを画像サイズに合わせるか、描画位置を調整
                            // ctx.clearRect(0, 0, canvas.width, canvas.height); // 既存の描画をクリア
                            // ctx.drawImage(img, 0, 0); // 画像を(0, 0)に描画
                            if (this.pasteTarget === "bg") {
                                this.backgroundImage.src = img.src;
                                this.backgroundImage.onload =
                                    this.updateCanvas.bind(this);
                            } else if (this.pasteTarget === "icon") {
                                this.iconImage.src = img.src;
                                this.iconImage.onload =
                                    this.updateCanvas.bind(this);
                            }
                            // saveButtonをアクティブにする
                            this.activateSaveButton(true);
                            
                            // ファイル選択のビジュアルフィードバック
                            if (this.pasteTarget === "bg") {
                                document.getElementById('select_background_image').classList.add('has-file');
                            } else if (this.pasteTarget === "icon") {
                                document.getElementById('select_icon_image').classList.add('has-file');
                            }
                        };
                    }
                }
            });
        }

        // ホバーイベントを設定
        listenHoverEvent(target_id, target) {
            // select_background_imageをホバーすると、pasteTargetに"bg"を代入
            // ホバーを解除すると、pasteTargetを空文字にする
            const target_node = document.getElementById(target_id);

            target_node.addEventListener("mouseover", () => {
                this.pasteTarget = target;
                // console.log("mouse in");
            });
            target_node.addEventListener("mouseout", () => {
                this.pasteTarget = "";
                // console.log("mouse out");
            });
        }
        
        setupDragAndDrop() {
            const setupDropZone = (elementId, targetType) => {
                const dropZone = document.getElementById(elementId);
                
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.add('drag-over');
                });
                
                dropZone.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('drag-over');
                });
                
                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.classList.remove('drag-over');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        const file = files[0];
                        if (file.type.startsWith('image/')) {
                            this.handleFileSelect(file, targetType);
                        }
                    }
                });
            };
            
            setupDropZone('select_background_image', 'bg');
            setupDropZone('select_icon_image', 'icon');
        }
        
        setupClickToSelect() {
            document.getElementById('select_background_image').addEventListener('click', () => {
                document.getElementById('image1').click();
            });
            
            document.getElementById('select_icon_image').addEventListener('click', () => {
                document.getElementById('image2').click();
            });
        }
        
        handleFileSelect(file, targetType) {
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            
            img.onload = () => {
                if (targetType === 'bg') {
                    this.backgroundImage.src = img.src;
                    this.backgroundImage.onload = this.updateCanvas.bind(this);
                    document.getElementById('select_background_image').classList.add('has-file');
                } else if (targetType === 'icon') {
                    this.iconImage.src = img.src;
                    this.iconImage.onload = this.updateCanvas.bind(this, true);
                    document.getElementById('select_icon_image').classList.add('has-file');
                    
                    // アイコンのサイズを取得
                    this.iconRectSize = img.width;
                }
                
                // saveButtonをアクティブにする
                this.activateSaveButton(true);
            };
            
            reader.readAsDataURL(file);
        }
        
        setupCopyButtons() {
            // コピーボタンのイベント設定
            ["copyButton", "inlineCopyButton"].forEach((id) => {
                const button = document.getElementById(id);
                if (button) {
                    button.addEventListener("click", () => {
                        if (this.previewCanvas) {
                            this.previewCanvas.toBlob((blob) => {
                                const item = new ClipboardItem({
                                    "image/png": blob,
                                });
                                navigator.clipboard.write([item]).then(() => {
                                    // 吹き出しを表示
                                    const tooltip = document.createElement("div");
                                    tooltip.textContent = "copied !";
                                    tooltip.style.position = "fixed";
                                    tooltip.style.background = "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)";
                                    tooltip.style.color = "#fff";
                                    tooltip.style.padding = "5px 10px";
                                    tooltip.style.borderRadius = "5px";
                                    tooltip.style.top = `${
                                        button.getBoundingClientRect().top - 30
                                    }px`;
                                    tooltip.style.left = `${
                                        button.getBoundingClientRect().left
                                    }px`;
                                    tooltip.style.zIndex = "1000";
                                    document.body.appendChild(tooltip);

                                    // 2秒後に吹き出しを削除
                                    setTimeout(() => {
                                        document.body.removeChild(tooltip);
                                    }, 2000);
                                });
                            });
                        }
                    });
                }
            });
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

                // グレーアウトエリアの高さ
                const grayOutHeight = (this.iconRectSize - 64) / 2;

                if (flag_draw_rectangle) {
                    // 0, 0を起点に、1280 x 161のサイズで白い枠線だけの四角形を描画
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, pickup_top, 1280, this.iconRectSize);

                    // アイコン画像の右上を起点に、白い塗りつぶし四角を描画
                    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.fillRect(
                        this.iconRectSize,
                        pickup_top,
                        1280 - this.iconRectSize,
                        grayOutHeight
                    );
                    ctx.fillRect(
                        this.iconRectSize,
                        pickup_top + grayOutHeight + 64,
                        1280 - this.iconRectSize,
                        grayOutHeight
                    );
                }

                // 2枚目の画像を重ねて描画
                ctx.drawImage(
                    this.iconImage,
                    0,
                    pickup_top,
                    this.iconRectSize,
                    this.iconRectSize
                );
                
                // プレビューエリアを更新
                this.updatePreview();
            }
        }
        
        updatePreview() {
            // プレビュー用のキャンバスを作成（背景画像全体を表示）
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvasElement.width;
            tempCanvas.height = this.canvasElement.height;
            const tempCtx = tempCanvas.getContext("2d");
            
            // 元のcanvas全体をコピー
            tempCtx.drawImage(this.canvasElement, 0, 0);
            
            // プレビューエリアを更新
            const previewArea = document.getElementById("recent_downloads");
            const placeholder = previewArea.querySelector('.preview-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            // 既存のキャンバスがあれば削除
            const existingCanvas = previewArea.querySelector('canvas');
            if (existingCanvas) {
                existingCanvas.remove();
            }
            
            // 新しいキャンバスを追加
            tempCanvas.style.width = '100%';
            tempCanvas.style.maxWidth = '100%';
            tempCanvas.style.height = 'auto';
            tempCanvas.style.borderRadius = '12px';
            tempCanvas.style.boxShadow = 'var(--shadow-lg)';
            previewArea.insertBefore(tempCanvas, previewArea.firstChild);
            
            // コピーボタンを表示
            const copyButtonArea = document.getElementById("copyButtonArea");
            copyButtonArea.style.display = "block";
            
            // グローバルに保存（コピーボタンで使用）
            this.previewCanvas = tempCanvas;
            
            // プレビューキャンバスにドラッグイベントを設定
            this.setPreviewCanvasEvent(tempCanvas);
        }

        activateSaveButton(flag) {
            // saveButtonをアクティブにする
            if (flag) {
                this.saveButtonElement.disabled = false;
                this.saveButtonElement.style.background = "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)";
            } else {
                this.saveButtonElement.disabled = true;
                this.saveButtonElement.style.backgroundColor = "#ccc";
            }
        }

        setButtonEvent(imageInput1, imageInput2, saveButton) {
            const self = this;
            imageInput1.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    self.handleFileSelect(file, 'bg');
                }
            });

            imageInput2.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    self.handleFileSelect(file, 'icon');
                }
            });

            saveButton.addEventListener("click", function () {
                self.updateCanvas(false, false);

                // 元のcanvasの一部をコピーするための一時キャンバスを作成
                const tempCanvas = document.createElement(self.id_canvas);
                tempCanvas.width = 1280;
                tempCanvas.height = self.iconRectSize;
                tempCanvas.style.width = "75%";
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

                // プレビューエリアを更新
                const previewArea = document.getElementById("recent_downloads");
                const placeholder = previewArea.querySelector('.preview-placeholder');
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
                
                // 既存のキャンバスがあれば削除
                const existingCanvas = previewArea.querySelector('canvas');
                if (existingCanvas) {
                    existingCanvas.remove();
                }
                
                // 新しいキャンバスを追加
                tempCanvas.style.maxWidth = '100%';
                tempCanvas.style.height = 'auto';
                tempCanvas.style.borderRadius = '12px';
                tempCanvas.style.boxShadow = 'var(--shadow-lg)';
                previewArea.insertBefore(tempCanvas, previewArea.firstChild);
                
                // コピーボタンを表示
                const copyButtonArea = document.getElementById("copyButtonArea");
                copyButtonArea.style.display = "block";

                // 一時キャンバスのデータをダウンロード用リンクに設定
                const link = document.createElement("a");
                link.download = "CoverTweak_image.png";
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
        
        setPreviewCanvasEvent(canvas) {
            const self = this;
            let isDraggingPreview = false;
            let startY = 0;
            let startPickupTop = 0;
            
            // カーソルスタイルを設定
            canvas.style.cursor = 'grab';
            
            canvas.addEventListener("mousedown", function (event) {
                event.preventDefault();
                isDraggingPreview = true;
                canvas.style.cursor = 'grabbing';
                
                // 開始位置を記録
                startY = event.clientY;
                startPickupTop = self.pickup_top;
            });
            
            const handleMouseMove = function (event) {
                if (isDraggingPreview) {
                    event.preventDefault();
                    
                    // ドラッグ量を計算
                    const rect = canvas.getBoundingClientRect();
                    const scaleY = self.canvasElement.height / rect.height;
                    const deltaY = (event.clientY - startY) * scaleY;
                    
                    // 新しい位置を計算
                    self.pickup_top = startPickupTop + deltaY;
                    
                    // 範囲制限
                    const minTop = 0;
                    const maxTop = self.canvasElement.height - self.iconRectSize;
                    self.pickup_top = Math.max(minTop, Math.min(maxTop, self.pickup_top));
                    
                    self.updateCanvas(false);
                }
            };
            
            canvas.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mousemove", handleMouseMove);
            
            const stopDragging = function () {
                if (isDraggingPreview) {
                    isDraggingPreview = false;
                    canvas.style.cursor = 'grab';
                }
            };
            
            canvas.addEventListener("mouseup", stopDragging);
            document.addEventListener("mouseup", stopDragging);
            
            // キャンバスから離れてもドキュメント上でmousemoveを追跡するため、mouseleaveは不要
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
