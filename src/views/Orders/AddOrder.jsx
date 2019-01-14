import React from 'react';
import Check from '@material-ui/icons/Check';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import GridItem from '../../components/Grid/GridItem';
import GridContainer from '../../components/Grid/GridContainer';
import Button from '../../components/CustomButtons/Button';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import CardFooter from '../../components/Card/CardFooter';
import CustomInput from '../../components/CustomInput/CustomInput';
import Snackbar from '../../components/Snackbar/Snackbar';
import ProductSearch from './ProductSearch';
import CustomerSearch from './CustomerSearch';
import OrderTable from './OrderTable';
import OrderService from '../../services/OrderService';
import TaxService from '../../services/TaxService';
import Location from '../../stores/Location';

const orderService = new OrderService();

const styles = {
  cardCategoryWhite: {
    color: 'rgba(255,255,255,.62)',
    margin: '0',
    fontSize: '14px',
    marginTop: '0',
    marginBottom: '0',
  },
  cardTitleWhite: {
    color: '#FFFFFF',
    marginTop: '0px',
    minHeight: 'auto',
    fontWeight: '300',
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: '3px',
    textDecoration: 'none',
  },
};

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(productId, productName, salesPrice) {
  const qty = 1;
  const discountPercent = 0;
  const discountAmount = 0;
  const discountType = 'percent';

  const price = priceRow(qty, salesPrice);
  const total = qty * price;
  return {
    productId,
    productName,
    qty,
    salesPrice,
    price,
    discountPercent,
    discountAmount,
    discountType,
    total,
  };
}

export default class AddOrder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customer: null,
      rows: [],
      discountPercent: 0.08,
      discountAmount: 0,
      notes: '',
      poNumber: '',
      taxes: [],
      allTaxes: [],
      openSnackbar: false,
      chargePst: true,
    };

    this.productChanged = this.productChanged.bind(this);
    this.priceChanged = this.priceChanged.bind(this);
    this.customerChanged = this.customerChanged.bind(this);
    this.clearCustomer = this.clearCustomer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveAsPaid = this.saveAsPaid.bind(this);
    this.saveAsDraft = this.saveAsDraft.bind(this);
    this.saveAsHold = this.saveAsHold.bind(this);
    this.saveAsAccount = this.saveAsAccount.bind(this);
  }

  async componentDidMount() {
    const taxes = await TaxService.getTaxes('Canada', 'BC');
    this.setState({
      taxes,
      allTaxes: taxes,
    });
  }

  productChanged(product) {
    const newRow = createRow(product.productId, product.productName, product.salesPrice);
    this.setState(prevState => ({
      rows: [...prevState.rows, newRow],
    }));
  }

  priceChanged(subTotal, total) {
    this.setState({
      subTotal,
      total,
    });
  }

  clearCustomer() {
    this.setState({ customer: null });
  }

  customerChanged(customer) {
    const { allTaxes } = this.state;
    // removing taxes with name like "pst" from the list
    // if the selected customer has PST number in their profile
    if (customer && customer.pstNumber) {
      const filterTaxes = allTaxes.reduce((filterTaxes, tax) => {
        if (!tax.taxName.toLowerCase().includes('pst')) {
          filterTaxes.push(tax);
        }
        return filterTaxes;
      }, []);

      this.setState({
        taxes: filterTaxes,
      });
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'PST Tax not charged for this customer!',
        snackbarColor: 'warning',
      });
    } else {
      this.setState({
        taxes: allTaxes,
      });
    }

    this.setState({
      customer,
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleCheckChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  validateCustomerCredit() {
    const { customer, total } = this.state;
    if (customer && customer.creditLimit > customer.accountBalance + total) {
      return false;
    }

    return true;
  }

  async saveOrder(orderStatus) {
    const {
      customer, rows, total, subTotal, discountPercent, discountAmount, notes, taxes, poNumber,
    } = this.state;
    const status = orderStatus;
    const orderDetails = rows.map(row => (
      {
        orderId: 0,
        orderDetailId: 0,
        productId: row.productId,
        amount: row.qty,
        unitPrice: row.salesPrice,
        discountPercent: row.discountPercent,
        discountAmount: row.discountAmount,
        discountType: row.discountType,
        subTotal: row.total,
        total: row.total - (row.discountType === 'percent' ? (row.discountPercent / 100) * row.total : row.discountAmount),
      }));
    const orderTaxes = taxes.map(tax => (
      {
        taxId: tax.taxId,
        taxAmount: (tax.percentage / 100) * subTotal,
      }));

    const order = {
      locationId: Location.getStoreLocation(),
      subTotal,
      total,
      discountPercent,
      discountAmount,
      customerId: customer !== null ? customer.customerId : null,
      status,
      notes,
      poNumber,
      pstNumber: customer !== null ? customer.pstNumber : null,
      orderTax: orderTaxes,
      orderDetail: orderDetails,
      // orderPayment: orderPayment, will set this in the API
    };

    const result = await orderService.saveOrder(order);
    if (result === false || result === null || result.StatusCode === 500 || result.StatusCode === 400) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Oops, looks like something went wrong!',
        snackbarColor: 'danger',
      });
      return false;
    }
    return result;
  }

  async saveAsPaid() {
    const result = await this.saveOrder('Paid');
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Order was Saved and marked as Paid successfully!',
        snackbarColor: 'success',
      });
      this.props.history.push(`/order/${result.orderId}`);
    }
  }

  async saveAsDraft() {
    const result = await this.saveOrder('Draft');
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Order was Saved as Draft successfully!',
        snackbarColor: 'warning',
      });
      this.props.history.push(`/order/${result.orderId}`);
    }
  }

  async saveAsHold() {
    const result = await this.saveOrder('OnHold');
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Order was Saved and marked as On Hold successfully!',
        snackbarColor: 'warning',
      });
      this.props.history.push(`/order/${result.orderId}`);
    }
  }

  async saveAsAccount() {
    if (this.validateCustomerCredit()) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: 'Customer is exceeding the credit limit!',
        snackbarColor: 'danger',
      });
      return;
    }

    const result = await this.saveOrder('Account');
    if (result && result.orderId) {
      this.setState({
        openSnackbar: true,
        snackbarMessage: "Order was Saved and Added to customer's Credit successfully!",
        snackbarColor: 'info',
      });
      this.props.history.push(`/order/${result.orderId}`);
    }
  }

  render() {
    const {
      rows,
      taxes,
      discountAmount,
      discountPercent,
      customer, openSnackbar, snackbarMessage, snackbarColor, notes, poNumber,
      chargePst,
    } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary">
                <div className={styles.cardTitleWhite}>New Order</div>
              </CardHeader>
              <CardBody>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <CustomerSearch customerChanged={this.customerChanged} />
                  </GridItem>
                </GridContainer>
                { customer ? (
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={12}>
                      <Card>
                        <CardBody>
                          <GridContainer>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Full Name"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.firstName} ${customer.firstName}`,
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="User Name"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.userName} `,
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Email"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.userName} `,
                                }}
                              />
                            </GridItem>
                          </GridContainer>
                          <GridContainer alignItems="flex-end">
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Credit Limit"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.creditLimit} $`,
                                  error: 'error',
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="Unpaid Orders Amount"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: `${customer.accountBalance} $`,
                                  error: 'error',
                                }}
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <CustomInput
                                labelText="PST Number"
                                formControlProps={{
                                  fullWidth: true,
                                }}
                                inputProps={{
                                  disabled: true,
                                  value: customer.pstNumber === null ? 'Not Provided' : `${customer.pstNumber} `,
                                }}
                              />
                              <FormControlLabel
                                control={(
                                  <Checkbox
                                    checked={chargePst}
                                    onChange={this.handleCheckChange('chargePst')}
                                    value="chargePst"
                                  />
                                )}
                                label="Charge PST"
                              />
                            </GridItem>
                            <GridItem xs={12} sm={12} md={3}>
                              <Button color="info" onClick={this.clearCustomer}>Clear</Button>
                            </GridItem>
                          </GridContainer>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </GridContainer>
                ) : (<div />)
                }
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <ProductSearch productChanged={this.productChanged} />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={12}>
                    <OrderTable
                      rows={rows}
                      taxes={taxes}
                      discountAmount={discountAmount}
                      discountPercent={discountPercent}
                      priceChanged={this.priceChanged}
                    />
                  </GridItem>
                </GridContainer>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={3}>
                    <CustomInput
                      labelText="PO Number"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        value: poNumber,
                        name: 'poNumber',
                        onChange: this.handleChange,
                      }}
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={9}>
                    <CustomInput
                      labelText="Notes"
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        multiline: true,
                        rows: 1,
                        value: notes,
                        name: 'notes',
                        onChange: this.handleChange,
                      }}
                    />
                  </GridItem>
                </GridContainer>
              </CardBody>
              <CardFooter>
                <GridContainer>
                  <GridItem xs>
                    <Button color="primary" onClick={this.saveAsPaid}>Mark As Paid</Button>
                  </GridItem>
                  <GridItem xs>
                    <Button color="info" onClick={this.saveAsDraft}>Save As Draft</Button>
                  </GridItem>
                  { customer ? (
                    <GridItem xs>
                      <Button color="info" onClick={this.saveAsAccount}>Use Customers Account</Button>
                    </GridItem>
                  ) : (<div />)
                  }
                  { customer ? (
                    <GridItem xs>
                      <Button color="info" onClick={this.saveAsHold}>Put On Hold</Button>
                    </GridItem>
                  ) : (<div />)
                  }
                </GridContainer>
              </CardFooter>
            </Card>
            <Snackbar
              place="tl"
              color={snackbarColor}
              icon={Check}
              message={snackbarMessage}
              open={openSnackbar}
              closeNotification={() => this.setState({ openSnackbar: false })}
              close
            />
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

// AddOrder.propTypes = {
//   classes: PropTypes.object.isRequired,
// };
