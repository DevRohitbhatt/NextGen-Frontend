import { useEffect } from "react";
import * as Styled from "./PrepChartStyles.jsx";
import axios from "axios";
import "../components/UnitSelector.jsx";
import UnitSelector from "../components/UnitSelector.jsx";
import DateSelector from "../components/DateSelector.jsx";
import Excel from "../assets/icons/file-excel.png";
import PDF from "../assets/icons/file-pdf.png";
import CSV from "../assets/icons/file-csv.png";
import Print from "../assets/icons/printer.png";
import TempData from "../tempData/PrepChart.json";

export default function PrepChart() {
  //Temporary API call to test it is working.
  //Todo: move this to a specific API calling section of the code.
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get(
  //         "https://localhost:7264/api/GetApp3Params?encryptedParams=" +
  //           document.location.href
  //       );
  //       console.log(response.data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  const data = JSON.parse(JSON.stringify(TempData));
  console.log(data);

  const Cell = ({ value }) => {
    return <Styled.TableCell>{value}</Styled.TableCell>;
  }

  return (
    <Styled.PageContainer>
      <Styled.PageTitle>Prep Chart</Styled.PageTitle>
      <Styled.OptionsRow>
        <Styled.DateAndUnitContainer>
          <UnitSelector />
          <DateSelector />
        </Styled.DateAndUnitContainer>
        <Styled.ExportOptionsContainer>
          <Styled.ExportOption>
            <Styled.OptionImage>
              <img src={Excel} alt="Excel" />
            </Styled.OptionImage>
          </Styled.ExportOption>
          <Styled.ExportOption>
            <Styled.OptionImage>
              <img src={PDF} alt="PDF" />
            </Styled.OptionImage>
          </Styled.ExportOption>
          <Styled.ExportOption>
            <Styled.OptionImage>
              <img src={CSV} alt="CSV" />
            </Styled.OptionImage>
          </Styled.ExportOption>
          <Styled.ExportOption>
            <Styled.OptionImage>
              <img src={Print} alt="Print" />
            </Styled.OptionImage>
          </Styled.ExportOption>
        </Styled.ExportOptionsContainer>
      </Styled.OptionsRow>

      <h2>Today</h2>
      <Styled.Table>
        <Styled.TableHeader>
          <Styled.TableHeaderCell>Item Name</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Prep Type</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Yield/Type</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Safety Factor</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Needed</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>On Hand</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Prep/Pull Amount</Styled.TableHeaderCell>
        </Styled.TableHeader>
        {data.Today.map((item, index) => (
          <Styled.TableRow key={index}>
            <Styled.TableCell>{item.itemName}</Styled.TableCell>
            <Styled.TableCell>{item.PrepType[0]}</Styled.TableCell>
            <Styled.TableCell>{item.YieldType}</Styled.TableCell>
            <Styled.TableCell>{item.SafetyFactor}</Styled.TableCell>
            <Styled.TableCell>{item.Needed}</Styled.TableCell>
            <Styled.TableCell>{item.OnHand}</Styled.TableCell>
            <Styled.TableCell>{item.PrepPullAmount}</Styled.TableCell>
          </Styled.TableRow>
        ))}
      </Styled.Table>

      <h2>Tomorrow</h2>
      <Styled.Table>
        <Styled.TableHeader>
          <Styled.TableHeaderCell>Item Name</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Prep Type</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Yield/Type</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Safety Factor</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Needed</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>On Hand</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Prep/Pull Amount</Styled.TableHeaderCell>
        </Styled.TableHeader>
        {data.Tomorrow.map((item, index) => (
          <Styled.TableRow key={index}>
            <Styled.TableCell>{item.itemName}</Styled.TableCell>
            <Styled.TableCell>{item.PrepType[0]}</Styled.TableCell>
            <Styled.TableCell>{item.YieldType}</Styled.TableCell>
            <Styled.TableCell>{item.SafetyFactor}</Styled.TableCell>
            <Styled.TableCell>{item.Needed}</Styled.TableCell>
            <Styled.TableCell>{item.OnHand}</Styled.TableCell>
            <Styled.TableCell>{item.PrepPullAmount}</Styled.TableCell>
          </Styled.TableRow>
        ))}
      </Styled.Table>

      <h2>Next Day</h2>
      <Styled.Table>
        <Styled.TableHeader>
          <Styled.TableHeaderCell>Item Name</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Prep Type</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Yield/Type</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Safety Factor</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Needed</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>On Hand</Styled.TableHeaderCell>
          <Styled.TableHeaderCell>Prep/Pull Amount</Styled.TableHeaderCell>
        </Styled.TableHeader>
        {data.NextDay.map((item, index) => (
          <Styled.TableRow key={index}>
            <Styled.TableCell>{item.itemName}</Styled.TableCell>
            <Styled.TableCell>{item.PrepType[0]}</Styled.TableCell>
            <Styled.TableCell>{item.YieldType}</Styled.TableCell>
            <Styled.TableCell>{item.SafetyFactor}</Styled.TableCell>
            <Styled.TableCell>{item.Needed}</Styled.TableCell>
            <Styled.TableCell>{item.OnHand}</Styled.TableCell>
            <Styled.TableCell>{item.PrepPullAmount}</Styled.TableCell>
          </Styled.TableRow>
        ))}
      </Styled.Table>
      
    </Styled.PageContainer>
  );
}
