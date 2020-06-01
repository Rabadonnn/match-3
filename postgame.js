let React = require('react');
let ReactDOM = require('react-dom');
let styled = require("styled-components").default;
let Database = require("database-api").default;

let config = require("visual-config-exposer").default.postGameScreen;

let database = new Database();

console.log(database);

database.getLeaderBoard().then(res => {
    console.log(res);
})

function getCardHeight() {
    let height = 150;
    if (config.submitName) {
        height += 60;
    }
    if (config.submitEmail) {
        height += 60;
    }
    return height;
}

const Card = styled.div`
    background-color: ${props => props.bgColor};
    width: ${ window.mobile() ? "300px" : "350px" };
    text-align: center;
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 0px;
    margin: auto;
    padding: 10px;
    height: ${props => props.height};
    border-radius: 30px;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.75);
    ${props => props.extra}
`;

const Text = styled.div`
    font-size: ${props => props.fontSize};
    color: ${props => props.fontColor}; 
    ${props => props.extra}
`;

const SubmitBox = styled.input`
    font-size: ${props => props.fontSize};
    color: ${props => props.fontColor};
    padding: 3px;
    ${props => props.extra}
`;

const Button = styled.button`
    width: ${props => props.width ? props.width : "60%"};
    height: ${props => props.height ? props.height : "15%"};
    border-radius: 20px;
    font-size: ${props => props.fontSize};
    background-color: ${props => props.bgColor ? props.bgColor : config.buttonColor};
    color: ${props => props.fontColor ? props.fontColor : config.buttonTextColor};
    border: none;
    outline: none;
    ${props => props.extra}
`;

class PostGameScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            score: window.score,
            name: "",
            email: ""
        }
    }

    render() {
        const card1Height = getCardHeight();
        const card2Height = 65;
        let card3Height = 0;

        if (config.showText) {
            card3Height += 42;
        }
        if (config.showCTA) {
            card3Height += 100;
        }
        
        const card1Top = (config.showText || config.showCTA) ? -(card1Height + card2Height + card3Height) * 0.6 : 0;
        const card2Top = card1Top + card1Height * 1.5 - 10;
        const card3Top = card2Top + card2Height + card3Height + 90;

        return (
            <div>
                <Card
                    bgColor = "white"
                    height = { card1Height + "px" }
                    extra = { `top: ${card1Top}px;` }
                >
                    <Text
                        fontSize = "30px"
                        fontColor = { config.textColor }
                    >
                        { config.scoreText + window.score }
                    </Text>
                    {
                        config.submitName && 
                        <div>
                            <Text
                                fontSize = "20px"
                                fontColor = { config.textColor }
                                extra = "margin-top: 20px; text-align: left; margin-left: 30px;"
                            >
                                Name:
                            </Text>
                            <SubmitBox
                                fontSize = "18px"
                                fontColor = { config.textColor }
                                extra = "width: 80%;"
                                onChange = { (ev) => {
                                    this.setState({ name: ev.target.value })
                                } }
                            >
                            </SubmitBox>
                        </div>
                    }
                    {
                        config.submitEmail &&
                        <div>
                            <Text
                                fontSize = "20px"
                                fontColor = { config.textColor }
                                extra = "margin-top: 20px; text-align: left; margin-left: 30px;"
                            >
                                Email:
                            </Text>
                             <SubmitBox
                                fontSize = "18px"
                                fontColor = { config.textColor }
                                extra = "width: 80%;"
                                onChange = { (ev) => {
                                    this.setState({ email: ev.target.value })
                                } }
                            >
                            </SubmitBox>
                        </div>
                    }
                    <Button
                        id = "button"
                        fontSize = "25px"
                        height = "60px"
                        extra = "margin-top: 20px;"
                        onClick = { () => {
                            console.log(this.state);
                            database.postScoreData(this.state).then(res => {
                                console.log("post: ", res);
                                database.getLeaderBoard().then(lbData => {
                                    console.log("data", lbData);
                                })
                            });
                        } }
                    >
                        { config.submitScoreText  }
                    </Button>
                </Card>
                <Card
                    bgColor = "transparent"
                    height = { card2Height  }
                    extra = { `top: ${card2Top}px; box-shadow: none;` }
                >
                    <Button 
                        id = "button"
                        height = "65px"
                        fontSize = "25px"
                        onClick = { () => {
                            window.restartGame();
                        } }
                    >
                        { config.playButtonText }
                    </Button>
                </Card>
                {
                    (config.showText || config.showCTA) &&
                    <Card
                        bgColor = "white"
                        height = { card3Height }
                        extra = { `top: ${card3Top}px; padding: 25px 10px; maxn-height: ${card3Height}px` }
                    >
                        {
                            config.showText && 
                            <Text
                                fontSize = "30px"
                                fontColor = { config.textColor  }
                                extra = "padding-bottom: 10px;"
                            >
                                { config.customText  }
                            </Text>
                        }
                        {
                            config.showCTA &&
                            <div>
                                <Text
                                    fontSize = "25px"
                                    fontColor = { config.textColor  }
                                >
                                    { config.ctaText }
                                </Text>
                                <Button
                                    id = "button"
                                    height = "60px"
                                    fontSize = "25px"
                                    extra = "margin-top: 10px;"
                                    onClick = { () => {
                                        window.open(config.ctaUrl);
                                    } }
                                >
                                    { config.ctaButtonText  }
                                </Button>
                            </div>
                        }
                    </Card>
                }
            </div>
        );
    }
}

module.exports = PostGameScreen;
