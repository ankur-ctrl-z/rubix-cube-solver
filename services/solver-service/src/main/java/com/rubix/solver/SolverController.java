package com.rubix.solver;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class SolverController {

    @GetMapping("/")
    public Map<String, String> health() {
        return Map.of("status", "Solver service running");
    }

    /**
     * Accepts a cube state as a 54-character string.
     * Each character is a digit 0-5 representing a color:
     * 0=white, 1=orange, 2=green, 3=red, 4=blue, 5=yellow
     * Order: TOP(9) LEFT(9) FRONT(9) RIGHT(9) BACK(9) BOTTOM(9)
     *
     * Example: GET /solve?state=000000000111111111222222222333333333444444444555555555
     */
    @GetMapping("/solve")
    public Map<String, String> solve(@RequestParam String state) {
        try {
            // validate
            if (state == null || state.length() != 54) {
                return Map.of("status", "error",
                        "error", "State must be exactly 54 characters");
            }
            if (!state.matches("[0-5]{54}")) {
                return Map.of("status", "error",
                        "error", "State must contain only digits 0-5");
            }

            // convert string to 6x9 byte array
            byte[][] cubeArray = new byte[6][9];
            for (int i = 0; i < 54; i++) {
                cubeArray[i / 9][i % 9] = (byte) Character.getNumericValue(state.charAt(i));
            }

            // solve using existing algorithm
            SolveCube solver = new SolveCube();
            String solution = solver.solveFromByteArray(cubeArray);

            // convert internal notation (Ri → R', i → ')
            String readableSolution = solution
                    .replaceAll("i", "'")
                    .trim();

            return Map.of(
                "status", "ok",
                "solution", readableSolution,
                "moves", String.valueOf(readableSolution.split("\\s+").length)
            );

        } catch (Exception e) {
            return Map.of("status", "error", "error", e.getMessage());
        }
    }
}