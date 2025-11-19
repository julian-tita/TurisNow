package app.TurisNow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TurisNowApplication {

	public static void main(String[] args) {
		SpringApplication.run(TurisNowApplication.class, args);
	}

}
