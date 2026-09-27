import com.deriva.domain.options.NormalDistribution;
import com.deriva.domain.market.OptionType;
import com.deriva.domain.options.BlackScholesModel;

public class TestCdf {
    public static void main(String[] args) {
        double d1 = -1.0024;
        System.out.println("cdf(d1): " + NormalDistribution.cdf(d1));
    }
}
