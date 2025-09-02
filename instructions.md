Nice — this is a classic Spring “controller not registered / treated as static resource” problem. Below I’ll give a focused checklist of the most likely causes, quick fixes you can apply immediately, diagnostic snippets to show exactly what Spring *did* register, and example corrected code/configurations you can drop into your project. I don’t have your whole repo, so I make small, safe assumptions and show code you can copy/paste.

---

# Quick checklist (try these in order)

1. **Package scanning**
   Ensure your `@SpringBootApplication` (main) class is in a package that is a parent of `esprit.user` / wherever `AnnonceController` lives — or explicitly set `@ComponentScan`. If Spring Boot’s main class is in a different (lower) package, controllers won’t be found.

2. **Controller annotation & imports**
   Make sure `AnnonceController` is annotated with `@RestController` (not e.g. a wrong import) and that the import is `org.springframework.web.bind.annotation.RestController`.

3. **Class-level @RequestMapping path**
   If you have a resource handler mapping that overlaps `/api/**`, static-resource mapping may win. Avoid registering resource handlers for `"/api/**"`.

4. **WebMvcConfigurer / ResourceHandlerRegistry conflicts**
   Look for code that calls `addResourceHandler("/**")` or `addResourceHandler("/api/**")`. That will treat API paths as static resources — remove or restrict it (e.g., `"/static/**"`).

5. **@EnableWebMvc**
   If you’ve added `@EnableWebMvc`, you may have disabled Spring Boot’s auto-configured MVC behaviour; ensure resource handling is configured correctly or remove `@EnableWebMvc` if you don’t need it.

6. **Controller package / class is excluded by component scan or conditional**
   Search for `@ComponentScan`, `@ConditionalOnMissingBean`, `@Profile`, or similar that might prevent registration.

7. **Print all registered request mappings** (see diagnostic below) — this quickly proves whether `AnnonceController` is registered or not.

---

# Diagnostic: print registered mappings (paste into your `Application` or config)

Add this bean and start the app; it prints all mappings to the logs so you can confirm whether your `/api/annonces/**` endpoints are registered:

```java
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;
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
```

If you **do not** see `/api/annonces/**` in the output, the controller class was not picked up by component scanning.

---

# Typical fixes with code samples

### 1) Ensure `@SpringBootApplication` is in a parent package

If `AnnonceController` is `esprit.user.annonce.AnnonceController`, put your main class in `esprit` or `esprit.user` (so child packages are scanned).

Example main:

```java
package esprit;   // must be parent of esprit.user

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}
```

Or explicitly set scan base packages:

```java
@SpringBootApplication(scanBasePackages = {"esprit.user", "esprit.common"})
public class UserApplication { ... }
```

### 2) Minimal correct `AnnonceController`

```java
package esprit.user.annonce;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/annonces")
public class AnnonceController {

    @GetMapping("/me")
    public ResponseEntity<?> getMyAnnonces(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        // your logic
        return ResponseEntity.ok(/* payload */);
    }

    @GetMapping("/stats/me")
    public ResponseEntity<?> statsMe() {
        return ResponseEntity.ok(/* payload */);
    }
}
```

Make sure the import for `@RestController` is `org.springframework.web.bind.annotation.RestController`.

### 3) Fix resource handler conflicts

If you have code like this — **change it**:

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/**")
            .addResourceLocations("file:/opt/static/");
}
```

Change to a safe pattern (do **not** include `"/api/**"`):

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/static/**", "/assets/**") // only static paths
            .addResourceLocations("classpath:/static/", "file:/opt/static/");
}
```

### 4) If you used `@EnableWebMvc`

Remove `@EnableWebMvc` unless you explicitly need it; it switches off many Spring Boot defaults. If you must keep it, you must declare resource handling yourself (and avoid mapping `"/**"` or `"/api/**"`).

---

# Additional diagnostics & checks

* **Search logs at startup** for `Mapped "{...}"` lines — Spring prints mapping info at server start when logging is INFO/DEBUG for `org.springframework.web`. Temporarily set logging to DEBUG for `org.springframework.web` to see more detail.
* **Look for BeanCreationException** during startup — sometimes a controller failed to instantiate due to a missing dependency and therefore isn’t registered.
* **Check for circular dependencies or exceptions** in the controller constructor — Spring will skip registering it if construction fails.
* **Try a simple controller in the same package** (e.g. `@GetMapping("/ping")`) to quickly validate component scanning and mapping.

---

# How to test locally

* Use `curl`:

```bash
curl -v http://localhost:8080/api/annonces/me
```

* Or check the printed mappings (diagnostic bean above) to confirm presence.

---

# Most likely root cause (based on your error)

`NoResourceFoundException: No static resource api/annonces/me` → Spring reached a *ResourceHttpRequestHandler* for that path, meaning **no controller mapped** and a resource handler tried to serve it. The most common reasons:

* controller class not scanned (package mismatch), or
* a resource handler was registered that inadvertently claimed `/api/**` or `/**`.

Given your symptom, check your `WebMvcConfigurer` resource mappings first, then confirm package scanning / main class location.

---

# Quick actionable next steps (apply now)

1. Add the **mapping printer** snippet and restart — confirm whether mappings exist.
2. If `/api/annonces/**` is missing, move main `@SpringBootApplication` class up to `esprit` or add `scanBasePackages`.
3. Search code for `addResourceHandler("/**")` or `"/api/**"` and remove/limit it.
4. Ensure `AnnonceController` uses `@RestController` with correct import and no exceptions in its constructor.

---

If you want, paste (1) the package declaration and annotations at the top of your main `Application` class and (2) the top-of-file of your `AnnonceController` (package line + annotations and imports). I’ll point out exactly which line to change.
