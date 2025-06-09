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
        
        // ドラッグ中フラグ
        isDraggingPreview = false;

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
            // 画像が読み込まれていない場合は何もしない
            if (!this.backgroundImage.complete || !this.iconImage.complete) {
                console.log('Images not complete:', this.backgroundImage.complete, this.iconImage.complete);
                return;
            }
            
            console.log('updateCanvas called with:', flag_resize, flag_draw_rectangle, 'pickup_top:', this.pickup_top);
            
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
            // プレビューエリアを取得
            const previewArea = document.getElementById("recent_downloads");
            const placeholder = previewArea.querySelector('.preview-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            // 既存のキャンバスをチェック
            const existingCanvas = previewArea.querySelector('canvas');
            
            if (existingCanvas && this.isDraggingPreview) {
                // ドラッグ中の場合は既存のキャンバスの内容だけを更新
                const tempCtx = existingCanvas.getContext("2d");
                tempCtx.clearRect(0, 0, existingCanvas.width, existingCanvas.height);
                tempCtx.drawImage(this.canvasElement, 0, 0);
                
                // 既存のキャンバスを保存
                this.previewCanvas = existingCanvas;
                return;
            }
            
            // 新しいキャンバスを作成
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = this.canvasElement.width;
            tempCanvas.height = this.canvasElement.height;
            const tempCtx = tempCanvas.getContext("2d");
            
            // 元のcanvas全体をコピー
            tempCtx.drawImage(this.canvasElement, 0, 0);
            
            // 既存のキャンバスがあれば削除
            if (existingCanvas) {
                // 古いキャンバスのイベントリスナーを削除
                existingCanvas.style.cursor = 'default';
                existingCanvas.dataset.eventsSet = 'false';
                existingCanvas.remove();
            }
            
            // 新しいキャンバスを追加
            // アスペクト比を計算して高さを設定
            const aspectRatio = tempCanvas.height / tempCanvas.width;
            
            tempCanvas.style.width = '100%';
            tempCanvas.style.maxWidth = '100%';
            tempCanvas.style.height = `${tempCanvas.height}px`;
            tempCanvas.style.maxHeight = '400px';
            tempCanvas.style.borderRadius = '12px';
            tempCanvas.style.boxShadow = 'var(--shadow-lg)';
            tempCanvas.style.display = 'block';
            previewArea.insertBefore(tempCanvas, previewArea.firstChild);
            
            console.log('Canvas inserted with dimensions:', {
                canvasWidth: tempCanvas.width,
                canvasHeight: tempCanvas.height,
                aspectRatio: aspectRatio
            });
            
            // コピーボタンを表示
            const copyButtonArea = document.getElementById("copyButtonArea");
            copyButtonArea.style.display = "block";
            
            // グローバルに保存（コピーボタンで使用）
            this.previewCanvas = tempCanvas;
            
            // ブラウザのレイアウト計算を強制的に実行
            tempCanvas.offsetHeight; // リフローを強制
            
            // キャンバスのサイズが正しく設定されるまで待ってからイベントを設定
            const setupEvents = () => {
                const rect = tempCanvas.getBoundingClientRect();
                console.log('Setting up events, canvas details:', {
                    rect: rect,
                    style: {
                        width: tempCanvas.style.width,
                        height: tempCanvas.style.height,
                        display: tempCanvas.style.display
                    },
                    clientDimensions: {
                        clientWidth: tempCanvas.clientWidth,
                        clientHeight: tempCanvas.clientHeight
                    },
                    offsetDimensions: {
                        offsetWidth: tempCanvas.offsetWidth,
                        offsetHeight: tempCanvas.offsetHeight
                    },
                    canvasDimensions: {
                        width: tempCanvas.width,
                        height: tempCanvas.height
                    },
                    parentElement: tempCanvas.parentElement,
                    isConnected: tempCanvas.isConnected
                });
                
                if (rect.height > 0 && rect.width > 0) {
                    // プレビューキャンバスにドラッグイベントを設定
                    this.setPreviewCanvasEvent(tempCanvas);
                } else {
                    // まだ高さが0の場合は少し待ってから再試行
                    console.log('Canvas still not properly sized, retrying...');
                    setTimeout(setupEvents, 100);
                }
            };
            
            // 次のフレームで実行
            requestAnimationFrame(setupEvents);
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
            
            // 既にイベントが設定済みかチェック
            if (canvas.dataset.eventsSet === 'true') {
                console.log('Events already set for this canvas');
                return;
            }
            
            // カーソルスタイルを設定
            canvas.style.cursor = 'grab';
            canvas.dataset.eventsSet = 'true';
            
            const updateIconPosition = function(event) {
                // デバッグ用ログ
                console.log('updateIconPosition called');
                console.log('canvas (parameter):', canvas);
                console.log('canvas id:', canvas.id);
                console.log('canvas parent:', canvas.parentElement);
                console.log('iconRectSize:', self.iconRectSize);
                console.log('canvasElement height:', self.canvasElement.height);
                
                // 必要な値が存在するかチェック
                if (!self.iconRectSize || !self.canvasElement.height) {
                    console.log('Missing required values for position calculation');
                    return;
                }
                
                // キャンバスの表示サイズをチェック
                const rect = canvas.getBoundingClientRect();
                console.log('canvas getBoundingClientRect:', rect);
                
                if (rect.height === 0 || rect.width === 0) {
                    console.log('Canvas dimensions are 0, cannot calculate position');
                    return;
                }
                
                console.log('rect:', rect);
                console.log('event.clientY:', event.clientY);
                console.log('rect.top:', rect.top);
                console.log('event.clientY - rect.top:', event.clientY - rect.top);
                
                const scaleY = self.canvasElement.height / rect.height;
                console.log('scaleY calculation:', self.canvasElement.height, '/', rect.height, '=', scaleY);
                
                // マウス位置をキャンバス内に制限
                const relativeY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
                const mouseY = relativeY * scaleY;
                console.log('relativeY:', relativeY, 'mouseY:', mouseY);
                
                console.log('Mouse calculation:', {
                    relativeY: relativeY,
                    scaleY: scaleY,
                    mouseY: mouseY,
                    iconRectSize: self.iconRectSize,
                    'mouseY - iconRectSize/2': mouseY - (self.iconRectSize / 2),
                    'Math.round result': Math.round(mouseY - (self.iconRectSize / 2))
                });
                
                // アイコンの上下中央がマウス位置になるように設定
                const calculatedTop = mouseY - (self.iconRectSize / 2);
                console.log('calculatedTop before Math.round:', calculatedTop);
                self.pickup_top = Math.round(calculatedTop);
                console.log('pickup_top after Math.round:', self.pickup_top);
                
                // 範囲制限
                const minTop = 0;
                const maxTop = self.canvasElement.height - self.iconRectSize;
                self.pickup_top = Math.max(minTop, Math.min(maxTop, self.pickup_top));
                
                // 更新（ドラッグ中はリサイズしない）
                console.log('Final pickup_top:', self.pickup_top);
                self.updateCanvas(false, true);
                
                // ドラッグ中でもプレビューを更新
                if (self.isDraggingPreview) {
                    self.updatePreview();
                }
            };
            
            canvas.addEventListener("mousedown", function (event) {
                event.preventDefault();
                self.isDraggingPreview = true;
                canvas.style.cursor = 'grabbing';
                
                // クリック時に位置更新
                updateIconPosition(event);
            });
            
            const handleMouseMove = function (event) {
                if (self.isDraggingPreview) {
                    event.preventDefault();
                    
                    // ドラッグ時も同じロジックで位置更新
                    updateIconPosition(event);
                }
            };
            
            canvas.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mousemove", handleMouseMove);
            
            const stopDragging = function () {
                if (self.isDraggingPreview) {
                    self.isDraggingPreview = false;
                    canvas.style.cursor = 'grab';
                    
                    // ドラッグ終了後にプレビューを更新
                    self.updatePreview();
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
