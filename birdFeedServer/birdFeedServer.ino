/*
  birdFeedServer
 
 Send a request and feed the bird.
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <Servo.h>
#include <TextFinder.h>
#include <stdlib.h>
#include <math.h>

// Enter a MAC address and IP address for your controller below.
// The IP address will be dependent on your local network:
byte mac[] = { 
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192,168,0,177);

// Initialize the Ethernet server library
// with the IP address and port you want to use 
// (port 80 is default for HTTP):
EthernetServer server(80);

//Setup servo
Servo myservo;
int pos = 0;
int maxSwing = 165;
int minSwing = 5;

void setup() {
 // Open serial communications and wait for port to open:
  Serial.begin(9600);
  Serial.println("makin my server baby...");

  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip);
  server.begin();
  Serial.print("server is at ");
  Serial.println(Ethernet.localIP());
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
}


void loop() {
  // listen for incoming clients
  EthernetClient client = server.available();
  if (client) {
    Serial.println("new client");
    String firstLine = "";
    boolean currentLineIsBlank = true;
    int lineNum = 0;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if(lineNum == 0) {
          firstLine.concat(c);
        }
        Serial.write(c);
        if (c == '\n' && currentLineIsBlank) {
          //End of Request
          router(client, firstLine);
          break;
        }
        if (c == '\n') {
          // you're starting a new line
          currentLineIsBlank = true;
          lineNum++;
        } 
        else if (c != '\r') {
          // you've gotten a character on the current line
          currentLineIsBlank = false;
        }
      } // if .available()
    } // while client.connected
    delay(1); // give the web browser time to receive the data
    // close the connection:
    client.stop();
    Serial.println("client disonnected");
  } // if client
} // loop

void toggleSeeds() {
  Serial.println("Feeding...");
  for(pos = minSwing; pos <= maxSwing; pos += 1) { 
    myservo.write(pos);
    delay(10);
  }
  for(pos = maxSwing; pos >= minSwing; pos-=1) { 
    myservo.write(pos);
    delay(10);
  }    
}

void router(EthernetClient client, String firstLine) {
  if(firstLine.indexOf("GET /") < 0) {
    notAccepted(client);
    return;
  }
  else if(firstLine.indexOf("/feedTheBirdOverride") >= 0) {
    toggleSeeds();
    sendResponse(client);
  }
  else if(firstLine.indexOf("/feedTheBird") >= 0) {
    checkCode(firstLine, client);
  }
  else {
    notFound(client); //404
  }
}

void checkCode(String firstLine, EthernetClient client) {
  if(firstLine.indexOf("feedCode=") < 0 || firstLine.indexOf("now=") < 0) {
    Serial.println("no parameters");
    invalidFeedCode(client);
    return;
  }
  String code = firstLine.substring(26,36);
  String now = firstLine.substring(44,54);
  char floatbuf[32]; // make this at least big enough for the whole string
  code.toCharArray(floatbuf, sizeof(floatbuf));
  long lCode = atol(floatbuf);
  char floatbufNow[32]; // make this at least big enough for the whole string
  now.toCharArray(floatbufNow, sizeof(floatbufNow));
  long lNow = atol(floatbufNow);
  Serial.println(String(lCode));
  Serial.println(String(lNow));
  Serial.println(String(abs(lCode - lNow)));
  Serial.println(String(abs(lNow - lCode)));
  if(lNow <= 1380001365 || lCode <= 1380001365) {
    Serial.println("bad code");
    invalidFeedCode(client);
    return;
  } 
  if(abs(lNow - lCode) <= 1800) {
    toggleSeeds();
    sendResponse(client);
  }
  else {
    invalidFeedCode(client);
  }  
}

void sendResponse(EthernetClient client) {
  // send a standard http response header
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");  // the connection will be closed after completion of the response
  client.println();
  //client.println("<meta http-equiv='refresh' content='0;URL=http://www.facebook.com/sharer.php?s=100&p[url]=http://i2.kym-cdn.com/entries/icons/original/000/000/590/marker_pwned.jpg&p[title]=Kyle%20tricked%20me%20with%20his%20arduino'>");
  client.println("{\"response\":200,\"code\":true,\"fed\":true}");
}
void invalidFeedCode(EthernetClient client) {
  // send a standard http response header
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");  // the connection will be closed after completion of the response
  client.println();
  //client.println("<meta http-equiv='refresh' content='0;URL=http://www.facebook.com/sharer.php?s=100&p[url]=http://i2.kym-cdn.com/entries/icons/original/000/000/590/marker_pwned.jpg&p[title]=Kyle%20tricked%20me%20with%20his%20arduino'>");
  client.println("{\"response\":200,\"code\":false,\"fed\":false}");
}

void notAccepted(EthernetClient client) {
  Serial.println("405 Not Allowed");
  // send a standard http response header
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");  // the connection will be closed after completion of the response
  client.println();
  client.println("{\"response\":405,\"code\":false,\"fed\":false}");
}
void notFound(EthernetClient client) {
  Serial.println("404 Not Found");
  // send a standard http response header
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");  // the connection will be closed after completion of the response
  client.println();
  client.println("{\"response\":404,\"code\":false,\"fed\":false}");
}
