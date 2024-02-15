import React from 'react';
import { useDrag } from 'react-dnd';
import * as Styled from "../pages/PrepChartTempStyles";

export function InventoryItem({Description, InventoryItemID,ThawTime}) {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "content",
        item: {InventoryItemID: InventoryItemID},
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))
    return (
        <>
         <Styled.TableRow ref={drag}>
            <Styled.TableCell>{InventoryItemID}</Styled.TableCell>
            <Styled.TableCell>{Description}</Styled.TableCell>
            <Styled.TableCell>{ThawTime}</Styled.TableCell>
          </Styled.TableRow>
        </>
    )
}
