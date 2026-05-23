package com.quind.tractorstore;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.syntax.ArchRuleDefinition;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class ArchUnitRulesTest {

    private static JavaClasses classes;

    @BeforeAll
    static void importClasses() {
        classes = new ClassFileImporter().importPackages("com.quind.tractorstore");
    }

    @Test
    void controllersShouldResideInApiPackages() {
        ArchRuleDefinition.classes()
                .that()
                .areAnnotatedWith(org.springframework.web.bind.annotation.RestController.class)
                .should()
                .resideInAPackage("..api..")
                .check(classes);
    }

    @Test
    void internalPackagesMustNotLeakAcrossModules() {
        for (String module : new String[] {"catalog", "inventory", "cart", "order", "notifications"}) {
            ArchRuleDefinition.noClasses()
                    .that()
                    .resideOutsideOfPackage("..%s..".formatted(module))
                    .should()
                    .dependOnClassesThat()
                    .resideInAPackage("..%s.internal..".formatted(module))
                    .because("Module '%s' internals must stay private".formatted(module))
                    .check(classes);
        }
    }
}
