package org.akira.ladux.service;

import org.akira.ladux.dto.internal.LineDraft;
import org.akira.ladux.dto.internal.OrderLineRequest;

import java.util.List;

public interface InventoryService {
    List<LineDraft> reserveStockAndPriceLines(List<OrderLineRequest> items);
}

