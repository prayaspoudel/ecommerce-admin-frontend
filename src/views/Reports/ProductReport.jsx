import React from 'react';
import MUIDataTable from 'mui-datatables';
import TextField from '@material-ui/core/TextField';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Button from '../../components/CustomButtons/Button';
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import ReportService from '../../services/ReportService';

function dateFormat(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const day = `${date.getUTCDate()}`.padStart(2, 0);
  const stringDate = [year, month, day].join('-');
  return stringDate;
}

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

export default class ProductSalesReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fromDate: '',
      toDate: '',
    };
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    const fromDate = dateFormat((new Date()).addHours(-8));
    const toDate = dateFormat((new Date()).addHours(-8));
    this.setState({
      fromDate,
      toDate,
    });
  }

  getMuiTheme = () => createMuiTheme({
    overrides: {
      MUIDataTableBodyCell: {
        root: {
          fontSize: '15px',
        },
      },
      MUIDataTable: {
        responsiveScroll: {
          maxHeight: 'none',
        },
      },
      MUIDataTableToolbar: {
        titleText: {
          fontSize: '12px',
          'margin-top': '45px',
          position: 'relative',
        },
      },
    },
  })

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  search() {
    const { fromDate, toDate } = this.state;
    const columns = ['locationName', 'productTypeName', 'productCode', 'productName', 'totalSales', 'amount', 'balance', 'onHold'];
    ReportService.getProductSales(fromDate, toDate)
      .then((results) => results.map((row) => columns.map((column) => row[column] || '')))
      .then((data) => this.setState({ reportData: data }));

    const productSalesDetailColumns = ['locationName', 'productTypeName', 'productCode', 'productName', 'orderId', 'customerCode', 'companyName', 'totalSales', 'amount', 'status'];
    ReportService.getProductSalesDetail(fromDate, toDate)
      .then((results) => results.map((row) => productSalesDetailColumns.map((column) => row[column] || '')))
      .then((data) => this.setState({ productSalesDetailData: data }));
  }

  render() {
    const styles = {
      cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
          color: 'rgba(255,255,255,.62)',
          margin: '0',
          fontSize: '14px',
          marginTop: '0',
          marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
          color: '#FFFFFF',
        },
      },
      cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
          color: '#777',
          fontSize: '65%',
          fontWeight: '400',
          lineHeight: '1',
        },
      },
    };

    const columns = [
      {
        name: 'Location',
      },
      {
        name: 'Category',
        options: {
          display: false,
        },
      },
      {
        name: 'Product Code',
        options: {
          filter: false,
        },
      },
      {
        name: 'Product Name',
        options: {
          filter: true,
        },
      },
      {
        name: 'Sales ($)',
        options: {
          filter: false,
        },
      },
      {
        name: 'Amount',
        options: {
          filter: false,
        },
      },
      {
        name: 'Balance',
        options: {
          filter: false,
        },
      },
      {
        name: 'On Hold',
        options: {
          filter: true,
        },
      }];

    const productSalesDetailColumns = [
      {
        name: 'Location',
      },
      {
        name: 'Category',
        options: {
          filter: false,
          display: false,
        },
      },
      {
        name: 'Product Code',
        options: {
          filter: true,
        },
      },
      {
        name: 'Product Name',
        options: {
          filter: true,
        },
      },
      {
        name: 'Order Id',
        options: {
          filter: false,
        },
      },
      {
        name: 'Customer Code',
        options: {
          filter: true,
          display: false,
        },
      },
      {
        name: 'Company Name',
        options: {
          filter: true,
        },
      },
      {
        name: 'Total Sales ($)',
        options: {
          filter: false,
        },
      },
      {
        name: 'Amount',
        options: {
          filter: false,
        },
      },
      {
        name: 'Status',
      }];

    const options = {
      filterType: 'checkbox',
      rowHover: true,
      resizableColumns: false,
      selectableRows: false,
      rowsPerPageOptions: [25, 50, 100],
      rowsPerPage: 25,
      responsive: 'scroll',
    };

    const {
      reportData, productSalesDetailData, fromDate, toDate,
    } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary">
                <div className={styles.cardTitleWhite}>Product Sales Report</div>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      onChange={this.handleChange('fromDate')}
                      id="date"
                      label="From Date"
                      type="date"
                      value={fromDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <TextField
                      onChange={this.handleChange('toDate')}
                      id="date"
                      label="To Date"
                      type="date"
                      value={toDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={3}>
                    <Button color="info" onClick={this.search}>Search</Button>
                  </GridItem>
                </GridContainer>
                <MuiThemeProvider theme={this.getMuiTheme()}>
                  <MUIDataTable
                    title="Product Sales Report"
                    data={reportData}
                    columns={columns}
                    options={options}
                  />
                </MuiThemeProvider>
                <MuiThemeProvider theme={this.getMuiTheme()}>
                  <MUIDataTable
                    title="Product Sales Detail Report"
                    data={productSalesDetailData}
                    columns={productSalesDetailColumns}
                    options={options}
                  />
                </MuiThemeProvider>
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}
