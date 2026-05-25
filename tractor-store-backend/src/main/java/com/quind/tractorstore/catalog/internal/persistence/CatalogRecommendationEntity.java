package com.quind.tractorstore.catalog.internal.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "catalog_recommendation")
public class CatalogRecommendationEntity {

    @Id
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String image;

    @Column(nullable = false)
    private String url;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private List<Integer> rgb;

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public List<Integer> getRgb() {
        return rgb;
    }

    public void setRgb(List<Integer> rgb) {
        this.rgb = rgb;
    }
}
