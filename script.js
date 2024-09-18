const imageInput1 = document.getElementById("image1");
const imageInput2 = document.getElementById("image2");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const saveButton = document.getElementById("saveButton");

let image1 = new Image();
let image2 = new Image();

let rectangle_top = 0;

const width_canvas = 1280;
function updateCanvas(flag_draw_rectangle = true) {
    if (image1.complete && image2.complete) {
        // キャンバスのサイズを設定
        let max_width = Math.max(image1.width, image2.width);
        let max_height = Math.max(image1.height, image2.height);

        canvas.width = width_canvas;
        canvas.height = (width_canvas * max_height) / max_width;

        // キャンバスをクリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1枚目の画像を描画
        ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);

        if (flag_draw_rectangle) {
            // 0, 0を起点に、1280 x 161のサイズで白い枠線だけの四角形を描画
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(0, rectangle_top, 1280, 161);

            // 128,0 を起点に、1232x48のサイズで白い塗りつぶし四角を描画
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillRect(161, rectangle_top, 1232, 48);
            ctx.fillRect(161, rectangle_top + 48 + 64, 1232, 48);
        }

        // 2枚目の画像を重ねて描画
        ctx.drawImage(image2, 0, rectangle_top, 161, 161);
    }
}

imageInput1.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        image1.src = URL.createObjectURL(file);
        image1.onload = updateCanvas;
    }
});

imageInput2.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        image2.src = URL.createObjectURL(file);
        image2.onload = updateCanvas;
    }
});

saveButton.addEventListener("click", function () {
    const link = document.createElement("a");
    link.download = "overlaid_image.png";

    updateCanvas(false);

    // 元のcanvasの一部をコピーするための一時キャンバスを作成
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1280;
    tempCanvas.height = 161;
    const tempCtx = tempCanvas.getContext("2d");

    // rectangle_top が正しいか確認（デバッグ用にconsole.logで値を確認）
    console.log("rectangle_top:", rectangle_top);

    // もとのcanvasの一部を一時キャンバスに描画
    tempCtx.drawImage(canvas, 0, -rectangle_top, 1280, canvas.height);

    // 一時キャンバスを画面に追加して描画範囲を確認（デバッグ用）
    document.body.appendChild(tempCanvas);

    // 一時キャンバスのデータをダウンロード用リンクに設定
    link.href = tempCanvas.toDataURL("image/png");

    // リンクをクリックしてダウンロードをトリガー
    link.click();

    updateCanvas(true);
});

// キャンバスの描画とクリック・マウスドラッグイベントの処理

const clickable_canvas = document.getElementById("canvas");
let isDragging = false;

clickable_canvas.addEventListener("mousedown", function (event) {
    isDragging = true;
    rectangle_top = event.offsetY - 80;
    updateCanvas();
});

clickable_canvas.addEventListener("mousemove", function (event) {
    if (isDragging) {
        rectangle_top = event.offsetY - 80;
        updateCanvas();
    }
});

clickable_canvas.addEventListener("mouseup", function () {
    isDragging = false;
});

clickable_canvas.addEventListener("mouseleave", function () {
    isDragging = false;
});
