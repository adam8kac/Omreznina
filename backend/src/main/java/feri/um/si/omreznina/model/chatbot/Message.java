package feri.um.si.omreznina.model.chatbot;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Message {
    
    private String role; //od koga je msg
    private String content; // dejanska vsebina
}
