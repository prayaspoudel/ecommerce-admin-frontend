import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TextField from '@material-ui/core/TextField';
// import Checkbox from "@material-ui/core/Checkbox";
import Success from "components/Typography/Success.jsx";
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

export default class OrderTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderRows: [],
      subTotal: 0,
      total: 0,
      taxes: [],
      totalDiscount: 0,
    };
  }

  componentDidMount() {
    const { rows } = this.props;
    this.setState({
      orderRows: rows
    });

    this.handleQuantityChanged = this.handleQuantityChanged.bind(this);
    this.handleDiscountAmountChanged = this.handleDiscountAmountChanged.bind(this);
    this.handleDiscountPercentChanged = this.handleDiscountPercentChanged.bind(this);
    this.handleDiscountTypeChanged = this.handleDiscountTypeChanged.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    const { rows, taxes, priceChanged } = this.props;
    if (rows.length !== prevProps.rows.length) {
      let orderRows = rows.slice();
      const subTotal = this.subtotal(orderRows);
      const totalDiscount = this.discount(orderRows);
      const total = this.total(subTotal, totalDiscount, taxes);
      this.setState({
          orderRows: rows,
          subTotal: subTotal,
          total: total,  
          totalDiscount: totalDiscount,
      });

      priceChanged(subTotal, total, totalDiscount);
    }
  }

  handleDiscountTypeChanged(event, discountType) {
    let orderRows = this.state.orderRows.slice();
    let { taxes, priceChanged } = this.props;
    for(let i in orderRows) {
        if(orderRows[i].productId == event.target.name){
          orderRows[i].discountType = discountType;
          this.setState ({orderRows});
          break;
        }
    }

    const subTotal = this.subtotal(orderRows);
    const totalDiscount = this.discount(orderRows);
    const total = this.total(subTotal, totalDiscount, taxes);
    this.setState(
      {
        subTotal: subTotal,
        total: total,  
        totalDiscount: totalDiscount,
      }
    );

    priceChanged(subTotal, total, totalDiscount);
  }

  handleQuantityChanged(event) {
    let { discountAmount, discountPercentage, orderRows } = this.state;
    let { taxes, priceChanged } = this.props;
    for(let i in orderRows) {
        if(orderRows[i].productId == event.target.name){
          orderRows[i].qty = event.target.value;
          orderRows[i].total = event.target.value * orderRows[i].salesPrice;
          this.setState ({orderRows});
          break;
        }
    }

    const subTotal = this.subtotal(orderRows);
    const discount = this.discount(subTotal, discountAmount, discountPercentage);
    const total = this.total(subTotal, discount, taxes);
    this.setState({
        subTotal: subTotal,
        total: total,  
        discount: discount,
    });

    priceChanged(subTotal, total, discount, discountPercentage, discountAmount);
  }

  handleDiscountAmountChanged(event) {
    let { taxes, priceChanged } = this.props;
    let orderRows = this.state.orderRows.slice();
    for(let i in orderRows) {
        if(orderRows[i].productId == event.target.name){
          orderRows[i].discountAmount = event.target.value;
          orderRows[i].discountPercent = 0;
          this.setState ({orderRows});
          break;
        }
    }

    const subTotal = this.subtotal(orderRows);
    const totalDiscount = this.discount(orderRows);
    const total = this.total(subTotal, totalDiscount, taxes);
    this.setState(
      {
        subTotal: subTotal,
        total: total,  
        totalDiscount: totalDiscount,
      }
    );

    priceChanged(subTotal, total, totalDiscount);
  }

  handleDiscountPercentChanged(event) {
    let { taxes, priceChanged } = this.props;
    let orderRows = this.state.orderRows.slice();
    for(let i in orderRows) {
        if(orderRows[i].productId == event.target.name){
          orderRows[i].discountAmount = 0;
          orderRows[i].discountPercent = event.target.value;
          this.setState ({orderRows});
          break;
        }
    }

    const subTotal = this.subtotal(orderRows);
    const totalDiscount = this.discount(orderRows);
    const total = this.total(subTotal, totalDiscount, taxes);
    this.setState(
      {
        subTotal: subTotal,
        total: total,  
        totalDiscount: totalDiscount,
      }
    );

    priceChanged(subTotal, total, totalDiscount);
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  ccyFormat(num) {
    return `${num.toFixed(2)} $`;
  }

  subtotal(items) {
    if(items.length === 0) {
      return 0;
    }
    return items.map(({ salesPrice, qty }) => salesPrice * qty).reduce((sum, i) => sum + i, 0);
  }

  discount(orderRows) {
    let totalDiscount= 0;
    for(let i in orderRows) {
      let discountAmount = orderRows[i].discountAmount === "" ? 0 : orderRows[i].discountAmount;
      let discountPercent = orderRows[i].discountPercent === "" ? 0 : orderRows[i].discountPercent;
      totalDiscount += (orderRows[i].discountType === 'percent') ?
        (discountPercent / 100) * orderRows[i].total : discountAmount;
    }
    return totalDiscount;
  }

  total(subTotal, discount, taxes) {
    const totalTax = taxes.map(({ percentage }) => (percentage / 100) * subTotal).reduce((sum, i) => sum + i, 0);
    return subTotal + totalTax - discount;
  }

  render() {
    const { taxes } = this.props;
    const { orderRows, total, subTotal, totalDiscount } = this.state;

    return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell numeric>Unit Price</TableCell>
            <TableCell>Discount</TableCell>
            <TableCell numeric>Total Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orderRows.map(row => {
            return (
              <TableRow key={row.productId}>
                <TableCell>{row.productName}</TableCell>
                <TableCell>
                  <TextField
                    name={row.productId}
                    value={row.qty}
                    onChange={this.handleQuantityChanged}
                    type="number"
                    style = {{width: 100}}
                  />
                </TableCell>                
                <TableCell numeric>{this.ccyFormat(row.salesPrice)}</TableCell>
                <TableCell>
                  <ToggleButtonGroup 
                    name={row.productId}
                    value={row.discountType} 
                    exclusive 
                    onChange={this.handleDiscountTypeChanged}
                    style = {{width: 100}}>
                    <ToggleButton value="percent" name={row.productId}>
                      %
                    </ToggleButton>
                    <ToggleButton value="amount" name={row.productId}>
                      $
                    </ToggleButton>
                  </ToggleButtonGroup>
                  { row.discountType == "amount" &&
                  ( <TextField
                      name={row.productId}
                      value={row.discountAmount}
                      onChange={this.handleDiscountAmountChanged}
                      type="number"
                      style = {{width: 100}}
                    /> )}
                  { row.discountType == "percent" &&
                  ( <TextField
                      name={row.productId}
                      value={row.discountPercent}
                      onChange={this.handleDiscountPercentChanged}
                      type="number"
                      style = {{width: 100}}
                    /> )}
                </TableCell>                
                <TableCell numeric>{this.ccyFormat(row.salesPrice * row.qty)}</TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell rowSpan={4} />
            <TableCell colSpan={3}>Total Discount</TableCell>
            <TableCell numeric>{this.ccyFormat(totalDiscount)}</TableCell>
          </TableRow>          
          <TableRow>
            <TableCell colSpan={3}>Subtotal</TableCell>
            <TableCell numeric>{this.ccyFormat(subTotal)}</TableCell>
          </TableRow>
          {taxes.map((tax) =>
            <TableRow>
              <TableCell>{tax.taxName}</TableCell>
              <TableCell numeric>{`${(tax.percentage).toFixed(0)} %`}</TableCell>
              <TableCell numeric>{this.ccyFormat((tax.percentage / 100) * subTotal)}</TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={3}><h3>Total</h3></TableCell>
            <TableCell numeric><Success><h3>{this.ccyFormat(total)}</h3></Success></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
    );
  }
}
