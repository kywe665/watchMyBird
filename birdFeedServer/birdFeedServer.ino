/*
  birdFeedServer
 
 Send a request and feed the bird.
 
 */

#include <SPI.h>
#include <Ethernet.h>
#include <Servo.h>
#include <TextFinder.h>

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
          Serial.println("THE END");
          Serial.println(firstLine);
          sendResponse(client);
          break;
        }
        if (c == '\n') {
          // you're starting a new line
          currentLineIsBlank = true;
          lineNum++;
          Serial.println(lineNum);
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
  if(pos < 90) {
    for(pos = 0; pos < 180; pos += 1)  // goes from 0 degrees to 180 degrees 
    {                                  // in steps of 1 degree 
      myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);                       // waits 15ms for the servo to reach the position 
    }
  }
  else {
    for(pos = 180; pos>=0; pos-=1)     // goes from 180 degrees to 0 degrees 
    {                                
      myservo.write(pos);              // tell servo to go to position in variable 'pos' 
      delay(15);                       // waits 15ms for the servo to reach the position 
    } 
  }
}

void sendResponse(EthernetClient client) {
  // send a standard http response header
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: text/html");
  client.println("Connection: close");  // the connection will be closed after completion of the response
  client.println();
  //client.println("<meta http-equiv='refresh' content='0;URL=http://www.facebook.com/sharer.php?s=100&p[url]=http://i2.kym-cdn.com/entries/icons/original/000/000/590/marker_pwned.jpg&p[title]=Kyle%20tricked%20me%20with%20his%20arduino'>");
  client.println("<!DOCTYPE HTML>");
  client.println("<html>");
  client.println("<p>check out the motor</p>");
  client.println("</html>");
  toggleSeeds();
}

