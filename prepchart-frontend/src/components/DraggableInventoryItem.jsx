import { useDrag } from "react-dnd";
import * as Styled from "../pages/PrepChartTempStyles";

export function InventoryItem({
  description,
  inventoryItemID,
  ThawTime,
  rowIndex,
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "content",
    item: { inventoryItemID: inventoryItemID, id: inventoryItemID },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

    return (
        <>
         <Styled.TableRow key={rowIndex} ref={drag}  >
            <Styled.TableCell> {inventoryItemID}</Styled.TableCell>
            <Styled.TableCell>{description}</Styled.TableCell>
         </Styled.TableRow>
        </>
    )
}
