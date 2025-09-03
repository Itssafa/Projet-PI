package esprit.user.config;
import org.springframework.context.annotation.Configuration;


// Configuration CORS simple qui évite l'erreur allowCredentials + "*"
@Configuration
public class SimpleCorsConfig {

    // Cette configuration peut être utilisée à la place de celle dans SecurityConfig
    // Décommentez le @Bean si vous voulez l'utiliser
    
    /*
    @Bean
    public CorsConfigurationSource simpleCorsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Solution 1: Origins spécifiques avec credentials
        configuration.addAllowedOrigin("http://localhost:4200");
        configuration.addAllowedOrigin("http://127.0.0.1:4200");
        configuration.addAllowedOrigin("http://localhost:4201");
        configuration.addAllowedOrigin("http://127.0.0.1:4201");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setAllowCredentials(true);
        
        // OU Solution 2: Wildcard sans credentials (décommentez si nécessaire)
        // configuration.addAllowedOrigin("*");
        // configuration.addAllowedMethod("*");
        // configuration.addAllowedHeader("*");
        // configuration.setAllowCredentials(false);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    */
}