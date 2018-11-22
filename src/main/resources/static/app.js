var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var topic;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
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
        });

    };
    
    var eventHandler = function(evt) {
        let pos = getMousePosition(evt);
        app.publishPoint(pos.x, pos.y)
        /*var pt = new Point(pos.x, pos.y);
        stompClient.send("/topic/newpoint." + topic, {}, JSON.stringify(pt)); 
        stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));*/ 
    };


    return {

        init: function () {
            var can = document.getElementById("canvas");
            //websocket connection
            if (window.PointerEvent) {
                can.addEventListener("pointerdown", eventHandler);
            } else {
                can.addEventListener("mousedown", eventHandler);
            }                
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            addPointToCanvas(pt);
			
            console.log(JSON.stringify(pt));
            //publicar el evento
            stompClient.send("/topic/newpoint." + topic, {}, JSON.stringify(pt));
            stompClient.send("/app/newpoint." + topic, {}, JSON.stringify(pt));
        },
        
        subscribeTo: function(topicToSubscribe){
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