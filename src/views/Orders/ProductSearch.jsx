import React from "react";
import PropTypes from "prop-types";
import deburr from "lodash/deburr";
import Autosuggest from "react-autosuggest";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";
import { withStyles } from "@material-ui/core/styles";
import ProductService from "../../services/ProductService.js";

let productService = new ProductService();

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input
        }
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.productName, query);
  const parts = parse(suggestion.productName, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
          ) : (
            <strong key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </strong>
          );
        })}
      </div>
    </MenuItem>
  );
}

function getSuggestions(value) {
  const { suggestions } = this.state;
  const inputValue = deburr(value.trim()).toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter(suggestion => {
        const keep =
          count < 5 &&
          (suggestion.productName.toLowerCase().includes(inputValue) ||
            suggestion.productCode.toLowerCase().includes(inputValue));

        if (keep) {
          count += 1;
        }

        return keep;
      });
}

function getSuggestionValue(suggestion) {
  return suggestion.productName;
}

const styles = theme => ({
  root: {
    height: 80,
    flexGrow: 1
  },
  container: {
    position: "relative"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  },
  divider: {
    height: theme.spacing.unit * 2
  }
});

class ProductSearch extends React.Component {
  state = {
    single: "",
    popper: "",
    suggestions: []
  };

  async componentDidMount() {
    const suggestions = await productService.getProducts();
    this.setState({ suggestions: suggestions });
  }

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleChange = name => (event, { newValue }) => {
    this.setState({
      [name]: newValue
    });
  };

  render() {
    const { classes } = this.props;

    const autosuggestProps = {
      renderInputComponent,
      suggestions: this.state.suggestions,
      onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue,
      renderSuggestion
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            classes,
            label: "",
            placeholder: "Search Products",
            value: this.state.popper,
            onChange: this.handleChange("popper"),
            inputRef: node => {
              this.popperNode = node;
            },
            InputLabelProps: {
              shrink: true
            }
          }}
          theme={{
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion
          }}
          renderSuggestionsContainer={options => (
            <Popper anchorEl={this.popperNode} open={Boolean(options.children)}>
              <Paper
                square
                {...options.containerProps}
                style={{
                  width: this.popperNode ? this.popperNode.clientWidth : null
                }}
              >
                {options.children}
              </Paper>
            </Popper>
          )}
        />
      </div>
    );
  }
}

ProductSearch.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ProductSearch);