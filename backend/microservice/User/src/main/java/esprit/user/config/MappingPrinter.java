package esprit.user.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
import org.springframework.web.method.HandlerMethod;
import java.util.Map;

@Component
public class MappingPrinter {

    @Bean
    public CommandLineRunner printMappings(RequestMappingHandlerMapping mapping) {
        return args -> {
            System.out.println("=== Registered request mappings ===");
            for (Map.Entry<RequestMappingInfo, HandlerMethod> e : mapping.getHandlerMethods().entrySet()) {
                System.out.println(e.getKey() + " -> " + e.getValue());
            }
            System.out.println("==================================");
        };
    }
}