package org.akira.ladux.catalog.application.port.out;

import java.util.List;

/** Internal lightweight result for the two-stage product pagination query. */
public record ProductIdPage(List<Integer> ids, long totalElements) {
}
