package feri.um.si.omreznina.model.chatbot;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    
    private String model;
    private List<Message> messages;
    private int n;
    private double temperature; // kreatinost modela -> application properties[0 - straight facts, 2 - mal vec svobode]
}
