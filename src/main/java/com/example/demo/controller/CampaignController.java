package com.example.demo.controller;

import com.example.demo.model.Campaign;
import com.example.demo.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignRepository campaignRepository;

    @GetMapping
    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    @PostMapping
    public Campaign createCampaign(@RequestBody Campaign campaign) {
        if (campaign.getId() == null || campaign.getId().isEmpty()) {
            campaign.setId(UUID.randomUUID().toString());
        }
        return campaignRepository.save(campaign);
    }

    @PutMapping("/{id}")
    public Campaign updateCampaign(@PathVariable String id, @RequestBody Campaign updatedCampaign) {
        if (campaignRepository.existsById(id)) {
            updatedCampaign.setId(id);
            return campaignRepository.save(updatedCampaign);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteCampaign(@PathVariable String id) {
        campaignRepository.deleteById(id);
    }
}
