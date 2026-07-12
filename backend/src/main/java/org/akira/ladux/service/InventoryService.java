package org.akira.ladux.service;

import org.akira.ladux.dto.LineDraft;
import org.akira.ladux.dto.request.OrderLineRequest;

import java.util.List;

public interface InventoryService {
    List<LineDraft> reserveStockAndPriceLines(List<OrderLineRequest> items);
}

