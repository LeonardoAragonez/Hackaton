package com.quind.tractorstore;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModulithArchitectureTest {

    @Test
    void verifiesModularStructure() {
        ApplicationModules.of(TractorStoreApplication.class).verify();
    }
}
