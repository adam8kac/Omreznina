package feri.um.si.omreznina.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import feri.um.si.omreznina.model.chatbot.ChatRequest;
import feri.um.si.omreznina.model.chatbot.ChatResponse;
import feri.um.si.omreznina.model.chatbot.Message;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Qualifier("restTemplateForOpenAI")
    @Autowired
    private RestTemplate restTemplate;

    @Value("${spring.ai.openai.chat.options.model}")
    private String model;

    @Value("${spring.ai.openai.chat.options.temperature}")
    private double temperature;

    private String apiUrl = "https://api.openai.com/v1/chat/completions";

    @PostMapping("/")
    public ResponseEntity<String> chat(@RequestParam("prompt") String prompt) {
        ChatResponse chatResponse = null;
        List<Message> chatMessages = new ArrayList<>();
        ChatRequest request = null;

        try {
            chatMessages.add(new Message("user", prompt));

            request = ChatRequest.builder()
                    .model(model)
                    .messages(chatMessages)
                    .n(1)
                    .temperature(temperature)
                    .build();

            chatResponse = restTemplate.postForObject(apiUrl, request, ChatResponse.class);
            return ResponseEntity.ok(chatResponse.toString());
        } catch (Exception e) {
            System.out.println(request);
            System.out.println(restTemplate.toString());
            return ResponseEntity.badRequest().body("Interaction with OpenAi failed" + e.toString());
        }
    }
}
