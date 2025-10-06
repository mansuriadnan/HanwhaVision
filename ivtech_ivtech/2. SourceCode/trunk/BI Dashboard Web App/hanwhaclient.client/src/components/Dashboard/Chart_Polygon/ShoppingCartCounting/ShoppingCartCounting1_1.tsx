import React from "react";
import { IShoppingCartCountingProps } from "../../../../interfaces/IChart";
import { Box, Typography } from "@mui/material";
import { formatNumber } from "../../../../utils/formatNumber";
import { useThemeContext } from "../../../../context/ThemeContext";

const ShoppingCartCounting1_1: React.FC<IShoppingCartCountingProps> = ({
  customizedWidth,
  ShoppingCartData,
  displayName,
  onZoomClick,
  openZoomDialog,
  setIsDraggable
}) => {
  const { theme } = useThemeContext();
  const totalQueueCount =
    ShoppingCartData?.reduce((acc, item) => acc + (item.queueCount || 0), 0) ||
    0;
  return (
    <Box sx={{ width: customizedWidth }}>
      <Box className="widget-main-wrapper">
        <Box className="widget-main-header">
          <Typography variant="h6" component="h2">
            {displayName}
          </Typography>
        </Box>

        <Box className="widget-main-body">
          <div className="widget-data-wrapper">
            <div className="shopping-cart-counting">
              <Box className="shopping-cart-counting-wrapper">
                <Box className="shopping-cart-counting-inner">
                  <img
                    src="/images/dashboard/Shopping_Cart_Counting.gif"
                    alt="Shopping Cart"
                    style={{ width: 80, height: 80 }}
                  />
                </Box>
              </Box>

              <Typography variant="h4" align="center" fontWeight="bold">
                {totalQueueCount}
              </Typography>
            </div>
          </div>
        </Box>

        <Box className="widget-main-footer">
          <Box className="widget-main-footer-value">
            <Typography>Total shopping cart counting :</Typography>
            <span> {formatNumber(totalQueueCount)}</span>
          </Box>
          {!openZoomDialog ? (
            <Box
              className="widget-main-footer-zoom-i"
              onMouseEnter={() => setIsDraggable?.(true)}
              onMouseLeave={() => setIsDraggable?.(false)}
            >
              <img
                src={theme === 'light' ? "/images/dashboard/drag.svg" : "/images/dark-theme/dashboard/drag.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
          {!openZoomDialog ? (
            <Box className="widget-main-footer-zoom-i" onClick={onZoomClick} id="zoomwidgetBtnShoppingCartCounting">
              <img
                src={theme === 'light' ? "/images/dashboard/ZoomWidget.svg" : "/images/dark-theme/dashboard/ZoomWidget.svg"}
                alt="vehicle"
                width={35}
                height={35}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export { ShoppingCartCounting1_1 };
