var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var topic;
    var canvas;

    var addPointToCanvas = function (point) {

        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (points) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        for (let i = 0; i < points.length - 1; i++) {
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
        }
        ctx.moveTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        console.log(stompClient);

        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + topic, function (eventBody) {
             var point=JSON.parse(eventBody.body);              
             addPointToCanvas(point);
             
             });
            stompClient.subscribe('/topic/newpolygon.' + topic, function (eventBody) {
                var points = JSON.parse(eventBody.body);
                addPolygonToCanvas(points);
            });
        });

    };

    var eventHandler = function (evt) {
        let pos = getMousePosition(evt);
        stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(new Point(pos.x, pos.y))); 
        /*var pt = new Point(pos.x, pos.y);
         stompClient.send("/topic/newpoint." + topic, {}, JSON.stringify(pt)); 
         stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));*/
    };


    return {

        init: function () {
            canvas = document.getElementById("canvas");
            //websocket connection
            if (window.PointerEvent) {
                canvas.addEventListener("pointerdown", eventHandler);
            } else {
                canvas.addEventListener("mousedown", eventHandler);
            }
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            

            console.log(JSON.stringify(pt));
            //publicar el evento
            stompClient.send("/topic/newpoint." + topic, {}, JSON.stringify(pt));
        },

        subscribeTo: function (topicToSubscribe) {
            topic = topicToSubscribe;
            connectAndSubscribe();
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();