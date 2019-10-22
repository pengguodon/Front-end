function canvasSignature (obj){
    let canvas = document.querySelector(obj.canvasName);
    console.log(canvas)
    if(canvas.getContext){
        let ctx = canvas.getContext("2d");
        canvas.width = obj.width || "1000";
        canvas.height= obj.height || "500";
        if(canvas.getCapture){
            canvas.setCapture();
        }
        //给画布注册点击事件
        canvas.onmousedown = function (e){
            var e = e || even ;
            ctx.beginPath();
            ctx.moveTo(e.clientX - canvas.offsetLeft,e.clientY - canvas.offsetTop);
            document.onmousemove = function (e){
                ctx.save();
                ctx.strokeStyle = obj.strokeColor || "#c40000";
                ctx.lineWidth = obj.lineWidth || "15";
                e = e || even;
                ctx.lineTo(e.clientX - canvas.offsetLeft,e.clientY - canvas.offsetTop);
                ctx.stroke();
                ctx.restore();
            }
            document.onmouseup = function(){
                document.onmousemove = null;
            }

        }
    } 
    return false;  
}