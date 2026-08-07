import Typography from '@mui/material/Typography';


function TextMui(
    {

    value="vacio",
    variant="h1",
    align="center",
    color="primary",
    onClick =() => {},
    sx = {},
    }
) {
    return(
        <Typography 
        variant={variant}
        color={color}
        align={align}
        onClick={() => onClick()}
        sx={sx}
        
        >

            {value}
        </Typography>
        
    )   
}

export default TextMui;
