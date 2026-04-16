import path from 'path';
import https from 'https';
import fetch from 'node-fetch'; // Import fetch directly
const agent = new https.Agent({ rejectUnauthorized: false }); 

const baseURL = process.env.IBKR_BASE_URL;
const userID = process.env.IBKR_USER_ID; 

const ibkr_cpgw_calls = {
    getAccounts: async () => {
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${baseURL}/portfolio/accounts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
                agent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response}`);
            }

            const data = await response.json();
            console.log('accounts loaded from IBKR CPGW');
            return data;
        } catch (error) {
            console.error(`Error fetching accounts: ${error}`);
            throw error;
        }
    }, 

    getIServerAccount: async () => {
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${baseURL}/iserver/account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
                agent,
                body: JSON.stringify({
                    acctId: userID
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response}`);
            }

            const data = await response.json();
            console.log(data)
            console.log('iServer/account endpoint called successfully');
            return data;
        } catch (error) {
            console.error(`Error fetching account: ${error}`);
            throw error;
        }
    }, 

    getPositions: async () => {
        try {
            const accounts = ibkr_cpgw_calls.getAccounts()
            console.log('portfolio/accounts endpoint called successfully for loading positions')
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${baseURL}/portfolio/${userID}/positions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
                agent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('positions loaded from IBKR CPGW');
            return data;
        } catch (error) {
            console.error(`Error fetching positions: ${error}`);
            throw error;
        }
    }, 

    getLedger: async () => {
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${baseURL}/portfolio/${userID}/ledger`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
                agent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); 
            console.log('ledger loaded from IBKR CPGW');
            return data;
        } catch (error) {
            console.error(`Error fetching ledger: ${error}`);
            throw error;
        }
    }, 

    getOrders: async (filters = undefined) => {
        try {
            const account = await ibkr_cpgw_calls.getIServerAccount()
            let url;
            if (filters === undefined) {
                url = `${baseURL}/iserver/account/orders`
            } else {
                url = `${baseURL}/iserver/account/orders?filters=${filters}`
            }
                
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(url,
             {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
                agent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); 
            console.log('orders loaded from IBKR CPGW');
            return data.orders;
        } catch (error) {
            console.error(`Error fetching orders: ${error}`);
            throw error;
        }
    }, 

    getTrades: async (days = undefined) => {
        try {
            const account = await ibkr_cpgw_calls.getIServerAccount()
            let url;
            if (days === undefined) {
                url = `${baseURL}/iserver/account/trades`
            } else {
                url = `${baseURL}/iserver/account/trades?days=${days}`
            }
                
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(url,
             {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary
                },
                agent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); 
            console.log('trades loaded from IBKR CPGW');
            return data;
        } catch (error) {
            console.error(`Error fetching trades: ${error}`);
            throw error;
        }
    }, 

    ordersCustomFilter: (orders, filter) => {
        try {
            const filteredOrders = orders.filter(order => {
                return order.order_ccp_status === filter;
            });
            return filteredOrders;
        }
        catch (error) {
            console.error(`Error fetching orders: ${error}`);
            throw error;
        }
    }, 

    keepAlive: async () => {
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`${baseURL}/tickle`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if necessary   
                },
                agent
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }   

            console.log('Keep alive successful');
        } catch (error) {
            console.error(`Error keeping alive: ${error}`);
            throw error;
        }
    }, 

    startKeepAlive: async () => {
        try {
            await ibkr_cpgw_calls.keepAlive()
            setInterval(ibkr_cpgw_calls.keepAlive, 60000); // Keep-alive every 60 seconds
        }
        catch (error) {
            console.error(`Error starting keep-alive: ${error}`);
        }
    }
};



// Call the function to start the keep-alive process
if (process.env.START_KEEP_ALIVE === 'TRUE') {
    ibkr_cpgw_calls.startKeepAlive();
}

// calling accounts function to make the rest cpgw active


// export the calls object for use in other modules
export default ibkr_cpgw_calls;

