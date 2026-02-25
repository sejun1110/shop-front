import styled from "styled-components";

export const Time = styled.input`
width:200px; max-width:100%;
height:36px;
border:1px solid #ccc !important;
border-radius:5px;
`;
export const Select = styled.select`
font-size:14px; padding:8px;
color:gray;
width:200px; max-width:100%;
height:36px;
border:1px solid #ccc !important;
border-radius:5px;
    option{
        padding:8px; font-size:14px;
        color:#333;
        background:#ccc;
        border-radius:5px !important;
        border:1px solid #ccc !important;
    }
    option:hover{
    background:gray;
    }
`;
export const Search = styled.input`
width:200px; max-width:100%;
height:36px;
border:1px solid #ccc !important;
border-radius:5px;
`;
export const Submit = styled.button`
width:100px; max-width:100%;
height:36px;
border:1px solid  #ccc !important;
border-radius:5px;
`;