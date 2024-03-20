import { useDrag } from "react-dnd";
import * as Styled from "../pages/PrepChartTempStyles";
import PropTypes from "prop-types";

export function InventoryItem({
  inventoryItemID,
  description,
  columnIndex,
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "content",
    item: { inventoryItemID: inventoryItemID},
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  if (!inventoryItemID) {
    return null; // or render an error message
  }

    return (
        <>
         <Styled.TableRow key={columnIndex} ref={drag}  >
            <Styled.TableCell> {inventoryItemID}</Styled.TableCell>
            <Styled.TableCell>{description}</Styled.TableCell>
         </Styled.TableRow>
        </>
    )
}
InventoryItem.propTypes = {
  inventoryItemID: PropTypes.number,
  description: PropTypes.string, // Add PropTypes validation for description prop
  columnIndex: PropTypes.number,
};