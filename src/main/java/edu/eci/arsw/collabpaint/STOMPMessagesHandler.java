/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    ConcurrentHashMap<String, ArrayList<Point>> polygonPoints = new ConcurrentHashMap();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);
        if (polygonPoints.containsKey(numdibujo)) {
            polygonPoints.get(numdibujo).add(pt);
            if (polygonPoints.get(numdibujo).size() > 3) {
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, polygonPoints.get(numdibujo));
                polygonPoints.clear();
            }
        } else {
            ArrayList<Point> puntos = new ArrayList();
            puntos.add(pt);
            polygonPoints.put(numdibujo, puntos);
        }
        //msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
    }
}
