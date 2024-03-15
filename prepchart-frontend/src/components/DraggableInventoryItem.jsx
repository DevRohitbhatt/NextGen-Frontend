import { useDrag } from "react-dnd";
import * as Styled from "../pages/PrepChartTempStyles";

export function InventoryItem({
  Description,
  InventoryItemID,
  ThawTime,
  rowIndex,
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "content",
    item: { InventoryItemID: InventoryItemID, id: InventoryItemID },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

    return (
        <>
         <Styled.TableRow key={InventoryItemID} ref={drag}  >
            <Styled.TableCell> {InventoryItemID}</Styled.TableCell>
            <Styled.TableCell>{Description}</Styled.TableCell>
         </Styled.TableRow>
        </>
    )
}
