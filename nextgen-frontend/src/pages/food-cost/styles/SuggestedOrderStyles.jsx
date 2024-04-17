import styled from "styled-components";

export const UnloadedMessage = styled.div`
  font-size: 1.5em;
  margin: auto;
  width: 100%;
  text-align: center;
`;

export const PageContainer = styled.div`
  width: 85%;
  margin: auto;
`;

export const PageTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizes.large};
  line-height: 1.1;
  margin: 15px 0 40px 0;
`;

export const PopupContainer = styled.div`
  grid-column-gap: 20px;
  display: grid;
  grid-template-columns: 50fr 50fr;
  margin-top: 10px;
`;
export const LeftUnitList = styled.div`
  color: #000;
  font-weight: 400;
  font-size: 12px;
`;

