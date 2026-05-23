package com.quind.tractorstore.catalog.internal.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "catalog_product")
public class CatalogProductEntity {

    @Id
    @Column(name = "product_id")
    private String productId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private List<String> highlights;

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getHighlights() {
        return highlights;
    }

    public void setHighlights(List<String> highlights) {
        this.highlights = highlights;
    }
}
