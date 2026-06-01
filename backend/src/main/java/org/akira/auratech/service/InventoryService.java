package org.akira.auratech.service;

import org.akira.auratech.dto.LineDraft;
import org.akira.auratech.dto.request.OrderLineRequest;

import java.util.List;

public interface InventoryService {
    List<LineDraft> reserveStockAndPriceLines(List<OrderLineRequest> items);
}

